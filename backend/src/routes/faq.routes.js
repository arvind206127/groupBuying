const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;
    const faqs = await db.fAQ.findMany({ where, orderBy: { order: 'asc' } });
    res.json({ success: true, faqs });
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const faq = await db.fAQ.create({ data: req.body });
    res.status(201).json({ success: true, faq });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const faq = await db.fAQ.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, faq });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await db.fAQ.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = router;
