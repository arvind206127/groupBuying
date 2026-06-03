const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const db = require('../config/database');

// POST /api/leads - Submit lead (public)
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, city, budget, message, propertyId, source, interest } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required' });
    }
    const lead = await db.lead.create({
      data: { name, email, phone, city, budget, message, propertyId, source, interest },
    });
    res.status(201).json({ success: true, message: 'Thank you! We will contact you shortly.', lead });
  } catch (error) { next(error); }
});

// POST /api/leads/contact - Specialized contact form (public)
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, phone, message, interest } = req.body;
    const lead = await db.lead.create({
      data: { 
        name, 
        email, 
        phone, 
        message, 
        interest,
        source: 'Main Contact Form'
      },
    });
    res.status(201).json({ success: true, message: 'Contact request received!', lead });
  } catch (error) { next(error); }
});

// GET /api/leads - Admin only
router.get('/', authenticate, authorize('ADMIN', 'RM'), async (req, res, next) => {
  try {
    const leads = await db.lead.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, leads });
  } catch (error) { next(error); }
});

module.exports = router;
