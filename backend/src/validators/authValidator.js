/**
 * Authentication Validators
 * Input validation rules for auth endpoints
 */
const { body } = require('express-validator');

/**
 * Registration validation rules
 */
const registerValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('E-posta adresi gerekli')
    .isEmail().withMessage('Geçerli bir e-posta adresi girin')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Şifre gerekli')
    .isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalı')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Şifre en az bir harf ve bir rakam içermeli'),
  
  body('firstName')
    .trim()
    .notEmpty().withMessage('Ad gerekli')
    .isLength({ min: 2, max: 100 }).withMessage('Ad 2-100 karakter arasında olmalı')
    .escape(),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Soyad gerekli')
    .isLength({ min: 2, max: 100 }).withMessage('Soyad 2-100 karakter arasında olmalı')
    .escape(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+90|0)?[0-9]{10}$/).withMessage('Geçerli bir telefon numarası girin')
];

/**
 * Login validation rules
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('E-posta adresi gerekli')
    .isEmail().withMessage('Geçerli bir e-posta adresi girin')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Şifre gerekli')
];

/**
 * Password change validation rules
 */
const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Mevcut şifre gerekli'),
  
  body('newPassword')
    .notEmpty().withMessage('Yeni şifre gerekli')
    .isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalı')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Şifre en az bir harf ve bir rakam içermeli')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Yeni şifre mevcut şifreden farklı olmalı');
      }
      return true;
    })
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator
};
