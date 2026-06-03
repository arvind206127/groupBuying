const express = require('express');
const router = express.Router();
const { authenticate, authorize, optionalAuth } = require('../middleware/auth.middleware');
const db = require('../config/database');
const { notifyGroupJoin, notifyGroupStatusChange } = require('../services/notification.service');

// GET /api/groups - List groups
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { propertyId, status } = req.query;
    const where = {};
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

    const groups = await db.group.findMany({
      where,
      include: {
        property: { select: { id: true, title: true, city: true, price: true, thumbnailUrl: true, bhk: true } },
        members: {
          where: { isActive: true },
          include: { user: { select: { id: true, name: true, avatar: true } } },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, groups });
  } catch (error) {
    next(error);
  }
});

// GET /api/groups/:id
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const group = await db.group.findUnique({
      where: { id: req.params.id },
      include: {
        property: { include: { developer: true } },
        members: {
          where: { isActive: true },
          include: { user: { select: { id: true, name: true, avatar: true, city: true } } },
        },
      },
    });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    // Hide WhatsApp link if not a member or not subscribed
    let isMember = false;
    if (req.user) {
      isMember = group.members.some(m => m.userId === req.user.id);
    }
    
    if (!isMember && req.user?.role !== 'ADMIN') {
      delete group.whatsappGroupLink;
    }

    res.json({ success: true, group });
  } catch (error) {
    next(error);
  }
});

// POST /api/groups/join/:propertyId - Join or create group
router.post('/join/:propertyId', authenticate, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const property = await db.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Check for active subscription
    const activeSubscription = await db.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      }
    });

    if (!activeSubscription && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'You need an active subscription to join a group.',
        needsSubscription: true 
      });
    }

    // Check existing membership
    const existingMembership = await db.groupMember.findFirst({
      where: { userId, group: { propertyId, status: { in: ['OPEN', 'FULL', 'NEGOTIATING'] } } },
    });

    if (existingMembership) {
      return res.status(400).json({ success: false, message: 'You already joined a group for this property' });
    }

    // Find open group
    let group = await db.group.findFirst({
      where: { propertyId, status: 'OPEN' },
      include: { _count: { select: { members: { where: { isActive: true } } } } },
    });

    // Create new group if none open
    if (!group) {
      group = await db.group.create({
        data: { propertyId, maxMembers: property.targetGroupSize },
        include: { _count: { select: { members: { where: { isActive: true } } } } },
      });
    }

    // Join group
    await db.groupMember.create({ data: { groupId: group.id, userId } });

    // Oversubscription & Status Logic
    const targetSize = property.targetGroupSize || 5;
    const maxCapacity = group.maxMembers || targetSize * 2;
    const memberCount = await db.groupMember.count({ where: { groupId: group.id, isActive: true } });

    let newStatus = group.status;
    if (memberCount >= maxCapacity) {
      newStatus = 'FULL';
    } else if (memberCount >= targetSize) {
      newStatus = 'NEGOTIATING';
    }

    if (newStatus !== group.status) {
      await db.group.update({ where: { id: group.id }, data: { status: newStatus } });
      // Notify all members about status change
      const groupMembers = await db.groupMember.findMany({ where: { groupId: group.id, isActive: true } });
      await Promise.all(groupMembers.map(m => 
        notifyGroupStatusChange(m.userId, property.title, newStatus)
      ));
    }

    // Notify joining user
    await notifyGroupJoin(userId, property.title);

     // Real-time notification
     const io = req.app.get('io');
     if (io) {
       io.to(`group-${group.id}`).emit('member-joined', {
         groupId: group.id,
         memberCount,
         maxCapacity,
         targetSize,
         status: newStatus
       });
 
       // Emit to admin room for real-time dashboard updates
       io.to('admin-room').emit('member-joined', {
         groupId: group.id,
         memberCount,
         status: newStatus
       });
 
       if (newStatus === 'FULL') {
         io.to('admin-room').emit('group-full', {
           groupId: group.id,
           message: `The group for "${property.title}" is now FULL at ${memberCount} members.`,
           property: property
         });
       }
     }

    res.status(201).json({ 
      success: true, 
      message: memberCount >= targetSize ? 'Joined the Over-subscription Waitlist.' : 'Successfully joined the group!',
    });
  } catch (error) { next(error); }
});

// DELETE /api/groups/:groupId/leave - Leave group
router.delete('/:groupId/leave', authenticate, async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const membership = await db.groupMember.findFirst({
      where: { groupId, userId, isActive: true },
      include: { group: true },
    });

    if (!membership) return res.status(404).json({ success: false, message: 'You are not a member of this group' });
    if (['NEGOTIATING', 'CLOSED'].includes(membership.group.status)) {
      return res.status(400).json({ success: false, message: 'Cannot leave group during negotiation phase' });
    }

    await db.groupMember.update({ where: { id: membership.id }, data: { isActive: false } });

    // Reopen group if it was full
    if (membership.group.status === 'FULL') {
      await db.group.update({ where: { id: groupId }, data: { status: 'OPEN', dealStatus: 'PENDING' } });
    }

    res.json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    next(error);
  }
});

// GET /api/groups/my/memberships - User's group memberships
router.get('/my/memberships', authenticate, async (req, res, next) => {
  try {
    const memberships = await db.groupMember.findMany({
      where: { userId: req.user.id, isActive: true },
      include: {
        group: {
          include: {
            property: { select: { id: true, title: true, city: true, price: true, thumbnailUrl: true, bhk: true } },
            _count: { select: { members: { where: { isActive: true } } } },
          },
        },
      },
    });
    res.json({ success: true, memberships });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
