/**
 * Admin Routes
 * /api/admin/*
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middlewares/auth');
const { requireAdmin } = require('../middlewares/roleGuard');
const validate = require('../middlewares/validate');
const { 
  idParamValidator 
} = require('../validators/listingValidator');
const { 
  rejectListingValidator, 
  markSoldValidator,
  userStatusValidator 
} = require('../validators/userValidator');

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/stats', adminController.getDashboardStats);

// Listings management
router.get('/listings', adminController.getAllListings);
router.get('/listings/pending', adminController.getPendingListings);

router.post(
  '/listings/:id/approve',
  idParamValidator,
  validate,
  adminController.approveListing
);

router.post(
  '/listings/:id/reject',
  rejectListingValidator,
  validate,
  adminController.rejectListing
);

router.post(
  '/listings/:id/mark-sold',
  markSoldValidator,
  validate,
  adminController.markListingSold
);

router.post(
  '/listings/:id/revert',
  idParamValidator,
  validate,
  adminController.revertListing
);

// Users management
router.get('/users', adminController.getAllUsers);

router.patch(
  '/users/:id/status',
  userStatusValidator,
  validate,
  adminController.updateUserStatus
);

// Action history
router.get('/actions', adminController.getActionHistory);

module.exports = router;
