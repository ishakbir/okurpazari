/**
 * Notification Controller
 * Handles notification-related HTTP requests
 */
const notificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/response');

/**
 * Get user notifications
 * GET /api/notifications
 */
const getNotifications = catchAsync(async (req, res) => {
  const { page, limit, unreadOnly } = req.query;
  
  const result = await notificationService.getUserNotifications(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    unreadOnly: unreadOnly === 'true'
  });

  sendPaginated(res, result.notifications, result.pagination, 'Bildirimler getirildi');
});

/**
 * Get unread notification count
 * GET /api/notifications/unread/count
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);

  sendSuccess(res, result, 'Okunmamış bildirim sayısı getirildi');
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(
    parseInt(req.params.id),
    req.user.id
  );

  if (!notification) {
    return sendSuccess(res, null, 'Bildirim bulunamadı', 404);
  }

  sendSuccess(res, { notification }, 'Bildirim okundu olarak işaretlendi');
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/read-all
 */
const markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);

  sendSuccess(res, result, 'Tüm bildirimler okundu olarak işaretlendi');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
