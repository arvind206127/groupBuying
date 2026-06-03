const db = require('../config/database');

/**
 * Create a notification for a user
 * @param {Object} params - Notification parameters
 * @param {string} params.userId - Target user ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} [params.type='INFO'] - Type: INFO, SUCCESS, WARNING, ALERT
 * @param {string} [params.link] - Optional redirect link
 */
const createNotification = async ({ userId, title, message, type = 'INFO', link }) => {
  try {
    const notification = await db.notification.create({
      data: { userId, title, message, type, link }
    });
    
    // In a real production app, we would emit a socket.io event here
    // to notify the user in real-time.
    // e.g. io.to(userId).emit('new-notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

const notifyGroupJoin = async (userId, propertyTitle) => {
  return createNotification({
    userId,
    title: 'Welcome to the Group!',
    message: `You have successfully joined the group for ${propertyTitle}. We'll notify you as more members join.`,
    type: 'SUCCESS',
    link: '/dashboard'
  });
};

const notifyGroupStatusChange = async (userId, propertyTitle, newStatus) => {
  return createNotification({
    userId,
    title: 'Group Status Updated',
    message: `The group for ${propertyTitle} is now in the ${newStatus} phase.`,
    type: 'INFO',
    link: '/dashboard'
  });
};

const notifyRMAssigned = async (userId, rmName) => {
  return createNotification({
    userId,
    title: 'Relationship Manager Assigned',
    message: `${rmName} has been assigned as your dedicated Relationship Manager.`,
    type: 'INFO',
    link: '/dashboard'
  });
};

module.exports = {
  createNotification,
  notifyGroupJoin,
  notifyGroupStatusChange,
  notifyRMAssigned
};
