const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', async (req, res, next) => {
  try {
    const testimonials = await db.testimonial.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, testimonials });
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const t = await db.testimonial.create({ data: req.body });
    res.status(201).json({ success: true, testimonial: t });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const t = await db.testimonial.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, testimonial: t });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await db.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
