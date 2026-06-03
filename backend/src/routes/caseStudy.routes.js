const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const db = require('../config/database');

router.get('/', async (req, res, next) => {
  try {
    const { publishedOnly } = req.query;
    const where = publishedOnly === 'true' ? { isPublished: true } : {};
    const caseStudies = await db.caseStudy.findMany({ 
      where, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json({ success: true, caseStudies });
  } catch (error) { next(error); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const cs = await db.caseStudy.findUnique({ where: { slug: req.params.slug } });
    if (!cs || !cs.isPublished) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, caseStudy: cs });
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cs = await db.caseStudy.create({ data: { ...req.body, slug } });
    res.status(201).json({ success: true, caseStudy: cs });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const cs = await db.caseStudy.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, caseStudy: cs });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await db.caseStudy.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = router;
