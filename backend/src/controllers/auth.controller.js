const db = require('../config/database');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../services/email.service');
const { createError } = require('../middleware/error.middleware');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (userId, portal) => {
  return jwt.sign({ userId, portal }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/send-otp
const sendOTP = async (req, res, next) => {
  try {
    const { email, name, portal = 'user' } = req.body;

    let user;
    if (portal === 'admin') {
      user = await db.admin.findUnique({ where: { email } });
      if (!user) return res.status(401).json({ success: false, message: 'Admin account not found.' });
    } else if (portal === 'developer') {
      user = await db.developer.upsert({
        where: { email },
        update: {},
        create: { email, name: name || 'Developer' },
      });
    } else {
      user = await db.user.upsert({
        where: { email },
        update: {},
        create: { email, name: name || null },
      });
    }

    // Invalidate old OTPs
    await db.oTP.updateMany({
      where: { email, isUsed: false },
      data: { isUsed: true },
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000);

    await db.oTP.create({
      data: { email, otp, expiresAt },
    });

    await sendOTPEmail(email, otp, user.name);

    res.json({
      success: true,
      message: process.env.NODE_ENV === 'development'
        ? `OTP sent! Check server console (dev mode). OTP: ${otp}`
        : 'OTP sent to your email. Please check your inbox.',
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, portal = 'user' } = req.body;

    // Development Master OTP for Admin
    if (process.env.NODE_ENV === 'development' && email === 'admin@realtogather.com' && otp === '123456') {
       const user = await db.admin.findUnique({ where: { email } });
       if (user) {
         const token = generateToken(user.id, 'admin');
         return res.json({ success: true, message: 'Master Login successful!', token, user: { ...user, portal: 'admin' } });
       }
    }

    const otpRecord = await db.oTP.findFirst({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await db.oTP.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Update user as verified
    let user;
    if (portal === 'admin') {
      user = await db.admin.update({
        where: { email },
        data: { isActive: true },
        select: { id: true, email: true, name: true, role: true, phone: true, permissions: true },
      });
    } else if (portal === 'developer') {
      user = await db.developer.update({
        where: { email },
        data: { isActive: true },
        select: { id: true, email: true, name: true, phone: true },
      });
    } else {
      user = await db.user.update({
        where: { email },
        data: { isVerified: true },
        select: { id: true, email: true, name: true, role: true, phone: true, city: true, avatar: true, isVerified: true },
      });
    }

    const token = generateToken(user.id, portal);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { ...user, portal },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const portal = req.user.portal || 'user';
    let user;

    if (portal === 'admin') {
      user = await db.admin.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, role: true, phone: true, permissions: true, createdAt: true },
      });
    } else if (portal === 'developer') {
      user = await db.developer.findUnique({
        where: { id: req.user.id },
        select: { id: true, email: true, name: true, phone: true, createdAt: true },
      });
    } else {
      user = await db.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true, email: true, name: true, role: true,
          phone: true, city: true, avatar: true, isVerified: true,
          budget: true, createdAt: true,
          _count: { select: { groupMembers: true, subscriptions: true } },
        },
      });
    }

    res.json({ success: true, user: { ...user, portal } });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

module.exports = { sendOTP, verifyOTP, getMe, logout };
