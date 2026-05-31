/**
 * Listing Validators
 * Input validation rules for listing endpoints
 */
const { body, query, param } = require('express-validator');
const { CATEGORIES, PRODUCT_CONDITIONS } = require('../config/constants');

/**
 * Create listing validation rules
 */
const createListingValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('İlan başlığı gerekli')
    .isLength({ min: 5, max: 200 }).withMessage('İlan başlığı 5-200 karakter arasında olmalı')
    .escape(),
  
  body('description')
    .trim()
    .notEmpty().withMessage('İlan açıklaması gerekli')
    .isLength({ min: 20, max: 5000 }).withMessage('İlan açıklaması 20-5000 karakter arasında olmalı'),
  
  body('price')
    .notEmpty().withMessage('Fiyat gerekli')
    .isFloat({ min: 0.01 }).withMessage('Fiyat 0\'dan büyük olmalı')
    .toFloat(),
  
  body('category')
    .trim()
    .notEmpty().withMessage('Kategori seçimi gerekli')
    .isIn(CATEGORIES).withMessage('Geçersiz kategori'),
  
  body('condition')
    .trim()
    .notEmpty().withMessage('Ürün durumu gerekli')
    .isIn(Object.values(PRODUCT_CONDITIONS)).withMessage('Geçersiz ürün durumu'),
  
  body('images')
    .optional()
    .isArray({ max: 10 }).withMessage('En fazla 10 resim yükleyebilirsiniz')
];

/**
 * Update listing validation rules
 */
const updateListingValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Geçersiz ilan ID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 }).withMessage('İlan başlığı 5-200 karakter arasında olmalı')
    .escape(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 }).withMessage('İlan açıklaması 20-5000 karakter arasında olmalı'),
  
  body('price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Fiyat 0\'dan büyük olmalı')
    .toFloat(),
  
  body('category')
    .optional()
    .trim()
    .isIn(CATEGORIES).withMessage('Geçersiz kategori'),
  
  body('condition')
    .optional()
    .trim()
    .isIn(Object.values(PRODUCT_CONDITIONS)).withMessage('Geçersiz ürün durumu'),
  
  body('images')
    .optional()
    .isArray({ max: 10 }).withMessage('En fazla 10 resim yükleyebilirsiniz')
];

/**
 * Listing query params validation (for filtering/pagination)
 */
const listingQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Geçersiz sayfa numarası')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit 1-100 arasında olmalı')
    .toInt(),
  
  query('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Geçersiz kategori'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Geçersiz minimum fiyat')
    .toFloat(),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Geçersiz maksimum fiyat')
    .toFloat(),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Arama terimi çok uzun')
];

/**
 * ID/Slug param validation
 * Accepts both numeric ID and slug string
 */
const idParamValidator = [
  param('id')
    .notEmpty().withMessage('İlan ID veya slug gerekli')
    .isString().withMessage('Geçersiz parametre')
];

module.exports = {
  createListingValidator,
  updateListingValidator,
  listingQueryValidator,
  idParamValidator
};
