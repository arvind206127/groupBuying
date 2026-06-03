const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { sendOTP, verifyOTP, getMe, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

router.post('/send-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  validate,
], sendOTP);

router.post('/verify-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  validate,
], verifyOTP);

router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;
