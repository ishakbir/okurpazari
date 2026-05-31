/**
 * User Routes
 * /api/users/*
 */
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { updateProfileValidator } = require('../validators/userValidator');

// All user routes require authentication
router.use(authenticate);

// Profile management
router.get('/profile', userController.getProfile);

router.put(
  '/profile',
  updateProfileValidator,
  validate,
  userController.updateProfile
);

// Change password
router.post(
  '/change-password',
  body('currentPassword')
    .notEmpty().withMessage('Mevcut şifre gerekli'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Yeni şifre en az 8 karakter olmalı')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('Şifre harf ve rakam içermeli'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Şifreler eşleşmiyor'),
  validate,
  userController.changePassword
);

module.exports = router;

