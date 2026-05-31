/**
 * Admin Controller
 * Handles admin-related HTTP requests
 */
const adminService = require('../services/adminService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../config/constants');

/**
 * Get all listings (admin view)
 * GET /api/admin/listings
 */
const getAllListings = catchAsync(async (req, res) => {
  const { page, limit, status, search } = req.query;
  
  const result = await adminService.getAllListings({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status,
    search
  });

  sendPaginated(res, result.listings, result.pagination, 'İlanlar getirildi');
});

/**
 * Get pending listings
 * GET /api/admin/listings/pending
 */
const getPendingListings = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  
  const result = await adminService.getPendingListings({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20
  });

  sendPaginated(res, result.listings, result.pagination, 'Bekleyen ilanlar getirildi');
});

/**
 * Approve listing
 * POST /api/admin/listings/:id/approve
 */
const approveListing = catchAsync(async (req, res) => {
  const listing = await adminService.approveListing(
    parseInt(req.params.id),
    req.user.id
  );

  sendSuccess(res, { listing }, SUCCESS_MESSAGES.LISTING_APPROVED);
});

/**
 * Reject listing
 * POST /api/admin/listings/:id/reject
 */
const rejectListing = catchAsync(async (req, res) => {
  const { reason } = req.body;
  
  const listing = await adminService.rejectListing(
    parseInt(req.params.id),
    req.user.id,
    reason
  );

  sendSuccess(res, { listing }, SUCCESS_MESSAGES.LISTING_REJECTED);
});

/**
 * Mark listing as sold
 * POST /api/admin/listings/:id/mark-sold
 */
const markListingSold = catchAsync(async (req, res) => {
  const { buyerId } = req.body;
  
  const listing = await adminService.markListingSold(
    parseInt(req.params.id),
    req.user.id,
    parseInt(buyerId)
  );

  sendSuccess(res, { listing }, SUCCESS_MESSAGES.LISTING_SOLD);
});

/**
 * Revert listing to previous status
 * POST /api/admin/listings/:id/revert
 */
const revertListing = catchAsync(async (req, res) => {
  const listing = await adminService.revertListing(
    parseInt(req.params.id),
    req.user.id
  );

  sendSuccess(res, { listing }, 'İşlem geri alındı');
});

/**
 * Get all users
 * GET /api/admin/users
 */
const getAllUsers = catchAsync(async (req, res) => {
  const { page, limit, search, role } = req.query;
  
  const result = await adminService.getAllUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    search,
    role
  });

  sendPaginated(res, result.users, result.pagination, 'Kullanıcılar getirildi');
});

/**
 * Update user status
 * PATCH /api/admin/users/:id/status
 */
const updateUserStatus = catchAsync(async (req, res) => {
  const { isActive } = req.body;
  
  const user = await adminService.updateUserStatus(
    parseInt(req.params.id),
    isActive,
    req.user.id
  );

  sendSuccess(res, { user }, 'Kullanıcı durumu güncellendi');
});

/**
 * Get admin action history
 * GET /api/admin/actions
 */
const getActionHistory = catchAsync(async (req, res) => {
  const { page, limit, adminId, listingId } = req.query;
  
  const result = await adminService.getActionHistory({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    adminId: adminId ? parseInt(adminId) : undefined,
    listingId: listingId ? parseInt(listingId) : undefined
  });

  sendPaginated(res, result.actions, result.pagination, 'İşlem geçmişi getirildi');
});

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await adminService.getDashboardStats();

  sendSuccess(res, { stats }, 'İstatistikler getirildi');
});

module.exports = {
  getAllListings,
  getPendingListings,
  approveListing,
  rejectListing,
  markListingSold,
  revertListing,
  getAllUsers,
  updateUserStatus,
  getActionHistory,
  getDashboardStats
};
