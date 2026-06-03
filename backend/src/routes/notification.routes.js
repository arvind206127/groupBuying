const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const db = require('../config/database');

// All notification routes require authentication
router.use(authenticate);

// GET /api/notifications - Get user notifications
router.get('/', async (req, res, next) => {
  try {
    const notifications = await db.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await db.notification.update({
      where: { 
        id: req.params.id,
        userId: req.user.id
      },
      data: { isRead: true }
    });
    
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', async (req, res, next) => {
  try {
    await db.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
