const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const db = require('../config/database');
const { settingsToObject, stripStyleSettings } = require('../utils/siteSettings');
const { notifyRMAssigned } = require('../services/notification.service');
const { uploadToBunny } = require('../services/bunny.service');
const { compressVideo, getVideoDuration, getFileSizeInMB } = require('../services/video.service');
const ensurePropertyStatuses = require('../utils/ensurePropertyStatuses');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|mp4|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, png, webp) and videos (mp4, webm) are allowed'));
  }
});

// All admin routes require ADMIN or SUPERADMIN role
router.use(authenticate, authorize('ADMIN', 'SUPERADMIN'));

// Dashboard Analytics
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalUsers, totalProperties, totalGroups, totalLeads,
      activeGroups, closedDeals, recentUsers, recentLeads,
      usersByRole, groupsByStatus, propertiesByCity,
    ] = await Promise.all([
      db.user.count(),
      db.property.count(),
      db.group.count(),
      db.lead.count(),
      db.group.count({ where: { status: { in: ['OPEN', 'FULL', 'NEGOTIATING'] } } }),
      db.group.count({ where: { status: 'CLOSED' } }),
      db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, email: true, name: true, role: true, createdAt: true } }),
      db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      db.user.groupBy({ by: ['role'], _count: { id: true } }),
      db.group.groupBy({ by: ['status'], _count: { id: true } }),
      db.property.groupBy({ by: ['city'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }),
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers, totalProperties, totalGroups, totalLeads,
        activeGroups, closedDeals, recentUsers, recentLeads,
        charts: { usersByRole, groupsByStatus, propertiesByCity },
      },
    });
  } catch (error) { next(error); }
});

// CRUD Users
router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const where = { role: 'BUYER' }; // Force role to BUYER
    if (search) where.OR = [{ email: { contains: search } }, { name: { contains: search } }];
    const [users, total] = await Promise.all([
      db.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: parseInt(limit) }),
      db.user.count({ where }),
    ]);
    res.json({ success: true, users, pagination: { page: parseInt(page), total } });
  } catch (error) { next(error); }
});

router.put('/users/:id', async (req, res, next) => {
  try {
    const user = await db.user.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const user = await db.user.findUnique({ where: { id: req.params.id } });
    await db.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
    res.json({ success: true, message: 'User status updated' });
  } catch (error) { next(error); }
});

router.put('/users/:id/toggle-active', async (req, res, next) => {
  try {
    const user = await db.user.update({ 
      where: { id: req.params.id }, 
      data: { isActive: req.body.isActive } 
    });
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

router.put('/users/:id/assign-rm', async (req, res, next) => {
  try {
    const { rmId } = req.body;
    const assignment = await db.rMAssignment.upsert({
      where: { rmId_userId: { rmId, userId: req.params.id } },
      update: { rmId },
      create: { rmId, userId: req.params.id }
    });
    // Notify user about RM assignment
    const rm = await db.user.findUnique({ where: { id: rmId }, select: { name: true } });
    await notifyRMAssigned(req.params.id, rm.name);

    res.json({ success: true, assignment });
  } catch (error) { next(error); }
});

// CRUD Properties (Admin convenience)
router.get('/properties', async (req, res, next) => {
  try {
    await ensurePropertyStatuses();
    const properties = await db.property.findMany({
      include: { developer: { select: { name: true } }, propertyStatus: { select: { id: true, name: true } }, _count: { select: { groups: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, properties });
  } catch (error) { next(error); }
});

// CRUD Admins
router.get('/admins', async (req, res, next) => {
  try {
    const admins = await db.admin.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, admins });
  } catch (error) { next(error); }
});

router.post('/admins', async (req, res, next) => {
  try {
    // Only SUPERADMIN can create new admins (optional check)
    if (req.user.role !== 'SUPERADMIN') {
      // return res.status(403).json({ success: false, message: 'Only Superadmin can add admins' });
    }
    const admin = await db.admin.create({ data: req.body });
    res.status(201).json({ success: true, admin });
  } catch (error) { next(error); }
});

router.put('/admins/:id', async (req, res, next) => {
  try {
    const admin = await db.admin.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, admin });
  } catch (error) { next(error); }
});

router.delete('/admins/:id', async (req, res, next) => {
  try {
    await db.admin.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Admin deleted' });
  } catch (error) { next(error); }
});

// CRUD Developers
router.get('/developers', async (req, res, next) => {
  try {
    const developers = await db.developer.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, developers });
  } catch (error) { next(error); }
});

router.post('/developers', async (req, res, next) => {
  try {
    const developer = await db.developer.create({ data: req.body });
    res.status(201).json({ success: true, developer });
  } catch (error) { next(error); }
});

router.put('/developers/:id', async (req, res, next) => {
  try {
    const developer = await db.developer.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, developer });
  } catch (error) { next(error); }
});

router.delete('/developers/:id', async (req, res, next) => {
  try {
    await db.developer.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Developer deleted' });
  } catch (error) { next(error); }
});

// CRUD Property Statuses
router.get('/property-statuses', async (req, res, next) => {
  try {
    await ensurePropertyStatuses();
    const statuses = await db.propertyStatus.findMany({
      where: { isActive: true },
      include: { _count: { select: { properties: true } } },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, statuses });
  } catch (error) { next(error); }
});

router.post('/property-statuses', async (req, res, next) => {
  try {
    await ensurePropertyStatuses();
    const name = req.body.name?.trim();
    if (!name) return res.status(400).json({ success: false, message: 'Property status name is required' });

    const data = { ...req.body, name };
    if (data.isActive === undefined) data.isActive = true;

    const existing = await db.propertyStatus.findUnique({ where: { name } }).catch(() => null);
    const status = existing
      ? await db.propertyStatus.update({ where: { id: existing.id }, data })
      : await db.propertyStatus.create({ data });

    res.status(existing ? 200 : 201).json({ success: true, status });
  } catch (error) { next(error); }
});

router.put('/property-statuses/:id', async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (typeof data.name === 'string') data.name = data.name.trim();
    const status = await db.propertyStatus.update({ where: { id: req.params.id }, data });
    res.json({ success: true, status });
  } catch (error) { next(error); }
});

router.delete('/property-statuses/:id', async (req, res, next) => {
  try {
    await db.propertyStatus.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Property status deleted' });
  } catch (error) { next(error); }
});

// Manage Groups
router.get('/groups', async (req, res, next) => {
  try {
    const groups = await db.group.findMany({
      include: {
        property: { select: { title: true, city: true } },
        members: {
          where: { isActive: true },
          include: { user: { select: { name: true, email: true, phone: true } } }
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, groups });
  } catch (error) { next(error); }
});

router.post('/groups', async (req, res, next) => {
  try {
    const group = await db.group.create({ data: req.body });
    res.status(201).json({ success: true, group });
  } catch (error) { next(error); }
});

router.put('/groups/:id', async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.maxMembers) data.maxMembers = parseInt(data.maxMembers);
    
    // Remove relations
    delete data.property;
    delete data.members;
    delete data._count;

    const group = await db.group.update({ where: { id: req.params.id }, data });
    res.json({ success: true, group });
  } catch (error) { next(error); }
});

router.delete('/groups/:id', async (req, res, next) => {
  try {
    await db.group.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Cluster disbanded' });
  } catch (error) { next(error); }
});

// Leads
router.get('/leads', async (req, res, next) => {
  try {
    const leads = await db.lead.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, leads });
  } catch (error) { next(error); }
});

router.put('/leads/:id', async (req, res, next) => {
  try {
    const lead = await db.lead.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, lead });
  } catch (error) { next(error); }
});

router.delete('/leads/:id', async (req, res, next) => {
  try {
    await db.lead.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Signal purged' });
  } catch (error) { next(error); }
});

// Site Settings
router.get('/settings', async (req, res, next) => {
  try {
    const settings = await db.siteSettings.findMany();
    res.json({ success: true, settings: settingsToObject(settings) });
  } catch (error) { next(error); }
});

router.put('/settings', async (req, res, next) => {
  try {
    const updates = Object.entries(stripStyleSettings(req.body));
    await Promise.all(updates.map(([key, value]) => {
      const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return db.siteSettings.upsert({ 
        where: { key }, 
        update: { value: valStr }, 
        create: { key, value: valStr } 
      });
    }));
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) { next(error); }
});

// RM List for dropdowns
router.get('/rms', async (req, res, next) => {
  try {
    const rms = await db.user.findMany({
      where: { role: 'RM', isActive: true },
      select: { id: true, name: true, email: true }
    });
    res.json({ success: true, rms });
  } catch (error) { next(error); }
});

// Assign RM to User
router.post('/assign-rm', async (req, res, next) => {
  try {
    const { rmId, userId } = req.body;
    const assignment = await db.rMAssignment.upsert({
      where: { rmId_userId: { rmId, userId } },
      update: {},
      create: { rmId, userId }
    });
    // Notify user about RM assignment
    const rm = await db.user.findUnique({ where: { id: rmId }, select: { name: true } });
    await notifyRMAssigned(userId, rm.name);

    res.json({ success: true, assignment });
  } catch (error) { next(error); }
});

// File Upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const folder = req.query.folder || 'misc';
    
    try {
      const cdnUrl = await uploadToBunny(req.file.path, folder, req.file.originalname);
      
      // Clean up local file asynchronously
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to remove temp file:', err);
      });

      res.json({ success: true, url: cdnUrl });
    } catch (uploadError) {
      console.error('Bunny.net Upload Error:', uploadError);
      return res.status(500).json({ success: false, message: 'Failed to upload to Bunny.net', error: uploadError.message });
    }
  } catch (error) {
    console.error('General Upload Error:', error);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// Project Videos
router.get('/project-videos', async (req, res, next) => {
  try {
    const projectVideos = await db.projectVideo.findMany({
      include: { property: { select: { title: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, projectVideos });
  } catch (error) { next(error); }
});

router.post('/project-videos', upload.single('videoUrl'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No video file uploaded' });
    }

    const videoPath = req.file.path;
    const compressedVideoPath = videoPath.replace(/(\.[^.]+)$/, '-compressed$1');
    
    try {
      // Compress video (reduce by 20%)
      console.log('Starting video compression...');
      await compressVideo(videoPath, compressedVideoPath);
      
      // Get video stats
      const duration = await getVideoDuration(compressedVideoPath);
      const fileSizeMB = getFileSizeInMB(compressedVideoPath);
      
      // Upload compressed video to Bunny
      console.log('Uploading compressed video to Bunny...');
      const cdnUrl = await uploadToBunny(compressedVideoPath, 'project-videos', req.file.originalname);
      
      // Clean up local files
      fs.unlink(videoPath, (err) => {
        if (err) console.error('Failed to remove original video:', err);
      });
      fs.unlink(compressedVideoPath, (err) => {
        if (err) console.error('Failed to remove compressed video:', err);
      });

      // Prepare video data
      const videoData = {
        title: req.body.title,
        videoUrl: cdnUrl,
        propertyId: req.body.propertyId,
        isActive: req.body.isActive === 'true' || req.body.isActive === true,
        isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
        duration: Math.round(duration),
        fileSizeMB: parseFloat(fileSizeMB),
        showAfter: req.body.showAfter ? new Date(req.body.showAfter) : null,
      };

      const video = await db.projectVideo.create({ data: videoData });
      res.status(201).json({ success: true, video, message: 'Video uploaded and compressed successfully' });
    } catch (error) {
      console.error('Video processing error:', error);
      // Clean up files on error
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      if (fs.existsSync(compressedVideoPath)) fs.unlinkSync(compressedVideoPath);
      res.status(500).json({ success: false, message: error.message });
    }
  } catch (error) { next(error); }
});

router.put('/project-videos/:id', upload.single('videoUrl'), async (req, res, next) => {
  try {
    const updateData = {
      title: req.body.title,
      propertyId: req.body.propertyId,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
      isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
      showAfter: req.body.showAfter ? new Date(req.body.showAfter) : null,
    };

    // If new video file uploaded
    if (req.file) {
      const videoPath = req.file.path;
      const compressedVideoPath = videoPath.replace(/(\.[^.]+)$/, '-compressed$1');
      
      try {
        // Compress video
        await compressVideo(videoPath, compressedVideoPath);
        
        // Get video stats
        const duration = await getVideoDuration(compressedVideoPath);
        const fileSizeMB = getFileSizeInMB(compressedVideoPath);
        
        // Upload to Bunny
        const cdnUrl = await uploadToBunny(compressedVideoPath, 'project-videos', req.file.originalname);
        
        // Clean up local files
        fs.unlink(videoPath, (err) => {
          if (err) console.error('Failed to remove original video:', err);
        });
        fs.unlink(compressedVideoPath, (err) => {
          if (err) console.error('Failed to remove compressed video:', err);
        });

        updateData.videoUrl = cdnUrl;
        updateData.duration = Math.round(duration);
        updateData.fileSizeMB = parseFloat(fileSizeMB);
      } catch (error) {
        console.error('Video processing error:', error);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
        if (fs.existsSync(compressedVideoPath)) fs.unlinkSync(compressedVideoPath);
        return res.status(500).json({ success: false, message: error.message });
      }
    }

    const video = await db.projectVideo.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, video });
  } catch (error) { next(error); }
});

router.delete('/project-videos/:id', async (req, res, next) => {
  try {
    await db.projectVideo.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Video entry removed' });
  } catch (error) { next(error); }
});

// Subscription Plans Management
router.get('/subscriptions', async (req, res, next) => {
  try {
    const subscriptions = await db.subscriptionPlan.findMany({
      orderBy: { displayOrder: 'asc', createdAt: 'desc' }
    });
    res.json({ success: true, subscriptions });
  } catch (error) { next(error); }
});

router.post('/subscriptions', async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      price: parseFloat(req.body.price),
      annualPrice: parseFloat(req.body.annualPrice),
      maxProperties: parseInt(req.body.maxProperties),
      maxGroups: parseInt(req.body.maxGroups),
      displayOrder: parseInt(req.body.displayOrder) || 0,
      isActive: req.body.isActive === 'true' || req.body.isActive === true
    };
    const subscription = await db.subscriptionPlan.create({ data });
    res.status(201).json({ success: true, subscription });
  } catch (error) { next(error); }
});

router.put('/subscriptions/:id', async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      price: parseFloat(req.body.price),
      annualPrice: parseFloat(req.body.annualPrice),
      maxProperties: parseInt(req.body.maxProperties),
      maxGroups: parseInt(req.body.maxGroups),
      displayOrder: parseInt(req.body.displayOrder) || 0,
      isActive: req.body.isActive === 'true' || req.body.isActive === true
    };
    const subscription = await db.subscriptionPlan.update({ where: { id: req.params.id }, data });
    res.json({ success: true, subscription });
  } catch (error) { next(error); }
});

router.delete('/subscriptions/:id', async (req, res, next) => {
  try {
    await db.subscriptionPlan.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Subscription plan deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
