const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const db = require('../config/database');

// All RM routes require RM role
router.use(authenticate, authorize('RM', 'ADMIN'));

// RM Dashboard Stats
router.get('/stats', async (req, res, next) => {
  try {
    const [assignedLeads, assignedUsers] = await Promise.all([
      db.lead.count({ where: { userId: req.user.id } }),
      db.rMAssignment.count({ where: { rmId: req.user.id } }),
    ]);

    res.json({
      success: true,
      stats: {
        assignedLeads,
        assignedUsers,
        confirmedDeals: 0, // Placeholder
      }
    });
  } catch (error) { next(error); }
});

// Get assigned users (Buyers)
router.get('/buyers', async (req, res, next) => {
  try {
    const assignments = await db.rMAssignment.findMany({
      where: { rmId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            city: true,
            budget: true,
            groupMembers: {
              include: {
                group: {
                  include: {
                    property: { select: { title: true, city: true, price: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({ success: true, buyers: assignments.map(a => a.user) });
  } catch (error) { next(error); }
});

// Get assigned leads
router.get('/leads', async (req, res, next) => {
  try {
    const leads = await db.lead.findMany({
      where: { 
        OR: [
          { userId: req.user.id },
          { message: { contains: 'RM:' + req.user.id } } // Simple tag in message as fallback
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, leads });
  } catch (error) { next(error); }
});

// Update lead status
router.put('/leads/:id', async (req, res, next) => {
  try {
    const lead = await db.lead.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, lead });
  } catch (error) { next(error); }
});

// Update assigned buyer
router.put('/buyers/:id', async (req, res, next) => {
  try {
    // Verify management link
    const link = await db.rMAssignment.findFirst({
      where: { rmId: req.user.id, userId: req.params.id }
    });
    
    if (!link && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Dossier Access Restricted' });
    }

    const { name, phone, city, budget, internalNotes } = req.body;
    const user = await db.user.update({
      where: { id: req.params.id },
      data: { 
        name, 
        phone, 
        city, 
        budget: budget ? parseFloat(budget) : undefined,
        internalNotes
      }
    });

    res.json({ success: true, user });
  } catch (error) { next(error); }
});

module.exports = router;
