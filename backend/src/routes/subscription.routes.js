const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const db = require('../config/database');

const PLANS = {
  basic: { name: 'Basic', price: 999, days: 30 },
  premium: { name: 'Premium', price: 2999, days: 90 },
  annual: { name: 'Annual', price: 9999, days: 365 },
};

router.post('/subscribe', authenticate, async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ success: false, message: 'Invalid plan' });
    const planDetails = PLANS[plan];
    const endDate = new Date(Date.now() + planDetails.days * 24 * 60 * 60 * 1000);
    const subscription = await db.subscription.create({
      data: { userId: req.user.id, plan: planDetails.name, price: planDetails.price, endDate },
    });

    // Real-time notification for admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('subscription-created', {
        subscription,
        user: { name: req.user.name, email: req.user.email }
      });
    }

    res.status(201).json({ success: true, message: `Subscribed to ${planDetails.name} plan!`, subscription });
  } catch (error) { next(error); }
});

router.get('/my', authenticate, async (req, res, next) => {
  try {
    const subscriptions = await db.subscription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, subscriptions });
  } catch (error) { next(error); }
});

router.get('/plans', async (req, res, next) => {
  res.json({ success: true, plans: PLANS });
});

// Admin routes
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const subscriptions = await db.subscription.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, subscriptions });
  } catch (error) { next(error); }
});

module.exports = router;
