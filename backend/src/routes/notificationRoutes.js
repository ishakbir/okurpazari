/**
 * Notification Routes
 * /api/notifications/*
 */
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { idParamValidator } = require('../validators/listingValidator');

// All notification routes require authentication
router.use(authenticate);

// Get notifications
router.get('/', notificationController.getNotifications);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// Mark single as read
router.patch(
  '/:id/read',
  idParamValidator,
  validate,
  notificationController.markAsRead
);

module.exports = router;
