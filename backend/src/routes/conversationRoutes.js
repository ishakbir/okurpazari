/**
 * Conversation Routes
 * /api/conversations/*
 */
const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const conversationController = require('../controllers/conversationController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// All conversation routes require authentication
router.use(authenticate);

// Get unread count (must be before /:id to avoid conflicts)
router.get('/unread-count', conversationController.getUnreadCount);

// List all conversations
router.get('/', conversationController.getConversations);

// Start a new conversation
router.post(
  '/start',
  body('sellerId').isInt({ min: 1 }).withMessage('Geçersiz satıcı ID'),
  body('listingId').isInt({ min: 1 }).withMessage('Geçersiz ilan ID'),
  body('message').optional().isString().trim(),
  validate,
  conversationController.startConversation
);

// Get single conversation
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('Geçersiz konuşma ID'),
  validate,
  conversationController.getConversation
);

// Get messages in a conversation
router.get(
  '/:id/messages',
  param('id').isInt({ min: 1 }).withMessage('Geçersiz konuşma ID'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  conversationController.getMessages
);

// Send a message
router.post(
  '/:id/messages',
  param('id').isInt({ min: 1 }).withMessage('Geçersiz konuşma ID'),
  body('content')
    .notEmpty().withMessage('Mesaj boş olamaz')
    .isLength({ max: 2000 }).withMessage('Mesaj çok uzun'),
  validate,
  conversationController.sendMessage
);

module.exports = router;
