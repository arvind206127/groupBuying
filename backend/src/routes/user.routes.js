const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const db = require('../config/database');

// GET /api/users/profile
router.get('/profile', authenticate, async (req, res, next) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, name: true, phone: true, role: true,
        city: true, budget: true, avatar: true, isVerified: true, createdAt: true,
        groupMembers: {
          where: { isActive: true },
          include: { group: { include: { property: { select: { id: true, title: true, city: true, thumbnailUrl: true, locality: true, price: true, bhk: true } } } } },
        },
        wishlist: {
          include: { property: true }
        },
        comparisons: {
          include: { property: true }
        },
        subscriptions: { where: { status: 'ACTIVE' }, take: 1, orderBy: { createdAt: 'desc' } },
      },
    });
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

// GET /api/users/comparison
router.get('/comparison', authenticate, async (req, res, next) => {
  try {
    const comparison = await db.comparison.findMany({
      where: { userId: req.user.id },
      include: { property: { include: { developer: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, comparison });
  } catch (error) { next(error); }
});

// POST /api/users/comparison - Toggle
router.post('/comparison', authenticate, async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    const existing = await db.comparison.findUnique({
      where: { userId_propertyId: { userId, propertyId } }
    });

    if (existing) {
      await db.comparison.delete({ where: { id: existing.id } });
      return res.json({ success: true, message: 'Removed from comparison', action: 'removed' });
    }

    // Optional: Limit comparison to e.g. 4 items
    const count = await db.comparison.count({ where: { userId } });
    if (count >= 4) {
        return res.status(400).json({ success: false, message: 'You can compare up to 4 properties' });
    }

    await db.comparison.create({ data: { userId, propertyId } });
    res.json({ success: true, message: 'Added to comparison', action: 'added' });
  } catch (error) { next(error); }
});

// PUT /api/users/profile
router.put('/profile', authenticate, async (req, res, next) => {
  try {
    const { name, phone, city, budget, avatar } = req.body;
    const user = await db.user.update({
      where: { id: req.user.id },
      data: { name, phone, city, budget: budget ? parseFloat(budget) : null, avatar },
      select: { id: true, email: true, name: true, phone: true, city: true, budget: true, avatar: true },
    });
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

// GET /api/users/notifications
router.get('/notifications', authenticate, async (req, res, next) => {
  try {
    const notifications = await db.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ success: true, notifications });
  } catch (error) { next(error); }
});

// PUT /api/users/notifications/:id/read
router.put('/notifications/:id/read', authenticate, async (req, res, next) => {
  try {
    await db.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) { next(error); }
});

// GET /api/users/my-rm
router.get('/my-rm', authenticate, async (req, res, next) => {
  try {
    const assignment = await db.rMAssignment.findFirst({
      where: { userId: req.user.id },
      include: { rm: { select: { id: true, name: true, email: true, phone: true, avatar: true } } }
    });
    res.json({ success: true, rm: assignment?.rm || null });
  } catch (error) { next(error); }
});

// POST /api/users/wishlist
router.post('/wishlist', authenticate, async (req, res, next) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    const existing = await db.wishlist.findUnique({
      where: { userId_propertyId: { userId, propertyId } }
    });

    if (existing) {
      await db.wishlist.delete({
        where: { id: existing.id }
      });
      return res.json({ success: true, message: 'Removed from wishlist', action: 'removed' });
    }

    await db.wishlist.create({
      data: { userId, propertyId }
    });

    res.json({ success: true, message: 'Added to wishlist', action: 'added' });
  } catch (error) { next(error); }
});

// GET /api/users/wishlist
router.get('/wishlist', authenticate, async (req, res, next) => {
  try {
    const wishlist = await db.wishlist.findMany({
      where: { userId: req.user.id },
      include: { property: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, wishlist });
  } catch (error) { next(error); }
});

module.exports = router;
