/**
 * User Validators
 * Input validation rules for user profile endpoints
 */
const { body, param } = require('express-validator');

/**
 * Update profile validation rules
 */
const updateProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Ad 2-100 karakter arasında olmalı')
    .escape(),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Soyad 2-100 karakter arasında olmalı')
    .escape(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+90|0)?[0-9]{10}$/).withMessage('Geçerli bir telefon numarası girin')
];

/**
 * Admin: User status change validation
 */
const userStatusValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Geçersiz kullanıcı ID'),
  
  body('isActive')
    .isBoolean().withMessage('Geçersiz durum değeri')
];

/**
 * Admin: Reject listing validation
 */
const rejectListingValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Geçersiz ilan ID'),
  
  body('reason')
    .trim()
    .notEmpty().withMessage('Red nedeni gereklidir')
    .isLength({ min: 3, max: 500 }).withMessage('Red nedeni 3-500 karakter arasında olmalı')
];

/**
 * Admin: Mark sold validation
 */
const markSoldValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Geçersiz ilan ID'),
  
  body('buyerId')
    .notEmpty().withMessage('Alıcı ID gerekli')
    .isInt({ min: 1 }).withMessage('Geçersiz alıcı ID')
];

module.exports = {
  updateProfileValidator,
  userStatusValidator,
  rejectListingValidator,
  markSoldValidator
};
