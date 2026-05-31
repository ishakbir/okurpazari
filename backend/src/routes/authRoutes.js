/**
 * Authentication Routes
 * /api/auth/*
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');
const { 
  registerValidator, 
  loginValidator, 
  changePasswordValidator 
} = require('../validators/authValidator');

// Public routes with rate limiting
router.post(
  '/register',
  authLimiter,
  registerValidator,
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  loginValidator,
  validate,
  authController.login
);

router.post(
  '/refresh',
  authController.refreshToken
);

// Protected routes
router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.get(
  '/me',
  authenticate,
  authController.getMe
);

router.put(
  '/password',
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword
);

module.exports = router;
