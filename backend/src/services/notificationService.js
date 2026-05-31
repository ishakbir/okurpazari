/**
 * Notification Service
 * Business logic for user notifications
 */
const { Notification } = require('../models');
const { PAGINATION } = require('../config/constants');

class NotificationService {
  /**
   * Create a notification
   * @param {Object} data - Notification data
   * @param {Object} transaction - Optional Sequelize transaction
   */
  async createNotification(data, transaction = null) {
    const options = transaction ? { transaction } : {};

    const notification = await Notification.create({
      user_id: data.userId,
      listing_id: data.listingId || null,
      type: data.type,
      title: data.title,
      message: data.message,
      is_read: false
    }, options);

    return notification.toApiObject();
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const offset = (page - 1) * limit;
    limit = Math.min(limit, PAGINATION.MAX_LIMIT);

    const where = { user_id: userId };
    
    if (unreadOnly) {
      where.is_read = false;
    }

    const { rows: notifications, count: totalItems } = await Notification.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      notifications: notifications.map(n => n.toApiObject()),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId) {
    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    return { count };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      return null;
    }

    await notification.update({ is_read: true });

    return notification.toApiObject();
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const [updatedCount] = await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false
        }
      }
    );

    return { updatedCount };
  }

  /**
   * Delete old notifications (cleanup job)
   */
  async deleteOldNotifications(daysOld = 30) {
    const { Op } = require('sequelize');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await Notification.destroy({
      where: {
        created_at: { [Op.lt]: cutoffDate },
        is_read: true
      }
    });

    return { deletedCount };
  }
}

module.exports = new NotificationService();
