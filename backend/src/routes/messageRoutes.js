/**
 * Message Routes
 * /api/messages/*
 */
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');
const { apiLimiter } = require('../middlewares/rateLimiter');

// Get messages for a listing (optionally authenticated for visibility filtering)
router.get(
  '/listing/:listingId',
  optionalAuth,
  param('listingId').isInt({ min: 1 }).withMessage('Geçersiz ilan ID'),
  validate,
  messageController.getListingMessages
);

// Post a question (authenticated)
router.post(
  '/listing/:listingId/question',
  authenticate,
  apiLimiter,
  param('listingId').isInt({ min: 1 }).withMessage('Geçersiz ilan ID'),
  body('content')
    .trim()
    .notEmpty().withMessage('Mesaj içeriği gerekli')
    .isLength({ min: 3, max: 1000 }).withMessage('Mesaj 3-1000 karakter arasında olmalı'),
  validate,
  messageController.postQuestion
);

// Reply to a question (seller only)
router.post(
  '/:questionId/reply',
  authenticate,
  param('questionId').isInt({ min: 1 }).withMessage('Geçersiz soru ID'),
  body('content')
    .trim()
    .notEmpty().withMessage('Yanıt içeriği gerekli')
    .isLength({ min: 1, max: 1000 }).withMessage('Yanıt 1-1000 karakter arasında olmalı'),
  body('isPublic')
    .optional()
    .isBoolean().withMessage('Görünürlük değeri geçersiz'),
  validate,
  messageController.replyToQuestion
);

module.exports = router;

