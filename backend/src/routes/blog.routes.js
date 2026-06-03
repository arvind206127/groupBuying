const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const db = require('../config/database');

// Public routes
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 9, tag } = req.query;
    const where = { isPublished: true };
    if (tag) where.tags = { string_contains: tag };
    const [blogs, total] = await Promise.all([
      db.blog.findMany({ where, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * parseInt(limit), take: parseInt(limit) }),
      db.blog.count({ where }),
    ]);
    res.json({ success: true, blogs, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const blog = await db.blog.findUnique({ where: { slug: req.params.slug } });
    if (!blog || !blog.isPublished) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, blog });
  } catch (error) { next(error); }
});

// Admin routes
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { title, content, excerpt, image, tags, isPublished } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const blog = await db.blog.create({
      data: { title, slug, content, excerpt, image, tags, isPublished, authorId: req.user.id, publishedAt: isPublished ? new Date() : null },
    });
    res.status(201).json({ success: true, blog });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const blog = await db.blog.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, blog });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    await db.blog.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
