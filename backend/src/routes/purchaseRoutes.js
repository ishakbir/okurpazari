/**
 * Purchase Routes
 * /api/purchases/*
 */
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate } = require('../middlewares/auth');
const { body, param } = require('express-validator');
const validate = require('../middlewares/validate');

// All routes require authentication
router.use(authenticate);

// Create purchase (buy a listing)
router.post(
  '/listing/:listingId',
  param('listingId').isInt({ min: 1 }).withMessage('Geçersiz ilan ID'),
  body('payment.cardNumber')
    .trim()
    .notEmpty().withMessage('Kart numarası gerekli')
    .isLength({ min: 16, max: 19 }).withMessage('Geçerli bir kart numarası girin'),
  body('payment.cardHolder')
    .trim()
    .notEmpty().withMessage('Kart sahibi adı gerekli'),
  body('payment.expiry')
    .trim()
    .notEmpty().withMessage('Son kullanma tarihi gerekli'),
  body('payment.cvv')
    .trim()
    .notEmpty().withMessage('CVV gerekli')
    .isLength({ min: 3, max: 4 }).withMessage('Geçerli CVV girin'),
  body('shipping.name')
    .trim()
    .notEmpty().withMessage('Alıcı adı gerekli'),
  body('shipping.address')
    .trim()
    .notEmpty().withMessage('Adres gerekli')
    .isLength({ min: 10 }).withMessage('Detaylı adres girin'),
  body('shipping.phone')
    .trim()
    .notEmpty().withMessage('Telefon gerekli'),
  validate,
  purchaseController.createPurchase
);

// Get my purchases (as buyer)
router.get('/my', purchaseController.getMyPurchases);

// Get my sales (as seller)
router.get('/sales', purchaseController.getMySales);

// Get purchase details
router.get(
  '/:id',
  param('id').isInt({ min: 1 }).withMessage('Geçersiz sipariş ID'),
  validate,
  purchaseController.getPurchaseById
);

// Mark as shipped (seller)
router.post(
  '/:id/ship',
  param('id').isInt({ min: 1 }).withMessage('Geçersiz sipariş ID'),
  body('carrier')
    .notEmpty().withMessage('Kargo firması seçin')
    .isIn(['PTT', 'Yurtiçi', 'MNG', 'Aras', 'Sürat']).withMessage('Geçersiz kargo firması'),
  validate,
  purchaseController.markAsShipped
);

// Mark as completed (buyer)
router.post(
  '/:id/complete',
  param('id').isInt({ min: 1 }).withMessage('Geçersiz sipariş ID'),
  validate,
  purchaseController.markAsCompleted
);

module.exports = router;
