const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { settingsToObject } = require('../utils/siteSettings');

// Public route to get non-style site settings
router.get('/', async (req, res, next) => {
  try {
    const settings = await db.siteSettings.findMany();
    res.json({ success: true, settings: settingsToObject(settings) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
