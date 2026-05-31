/**
 * Listing Routes
 * /api/listings/*
 */
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const { requireAnyRole } = require('../middlewares/roleGuard');
const { checkListingAccess, checkListingEditable } = require('../middlewares/listingAccess');
const validate = require('../middlewares/validate');
const { createListingLimiter } = require('../middlewares/rateLimiter');
const { 
  createListingValidator, 
  updateListingValidator,
  listingQueryValidator,
  idParamValidator
} = require('../validators/listingValidator');

// Public routes
router.get(
  '/',
  listingQueryValidator,
  validate,
  listingController.getActiveListings
);

// Protected routes - user's own listings
router.get(
  '/my',
  authenticate,
  listingController.getMyListings
);

router.get(
  '/my/bought',
  authenticate,
  listingController.getMyPurchasedListings
);

router.get(
  '/my/stats',
  authenticate,
  listingController.getMyListingStats
);

// Create listing
router.post(
  '/',
  authenticate,
  createListingLimiter,
  createListingValidator,
  validate,
  listingController.createListing
);

// Single listing operations (with access check)
router.get(
  '/:id',
  optionalAuth,
  idParamValidator,
  validate,
  checkListingAccess,
  listingController.getListing
);

router.put(
  '/:id',
  authenticate,
  updateListingValidator,
  validate,
  checkListingAccess,
  checkListingEditable,
  listingController.updateListing
);

router.delete(
  '/:id',
  authenticate,
  idParamValidator,
  validate,
  listingController.deleteListing
);

module.exports = router;
