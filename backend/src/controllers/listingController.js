/**
 * Listing Controller
 * Handles listing-related HTTP requests
 */
const listingService = require('../services/listingService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../config/constants');

/**
 * Get all active listings (public)
 * GET /api/listings
 */
const getActiveListings = catchAsync(async (req, res) => {
  const { page, limit, category, minPrice, maxPrice, search } = req.query;
  
  const result = await listingService.getActiveListings({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    category,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    search
  });

  sendPaginated(res, result.listings, result.pagination, 'İlanlar getirildi');
});

/**
 * Get user's own listings
 * GET /api/listings/my
 */
const getMyListings = catchAsync(async (req, res) => {
  const { page, limit, status } = req.query;
  
  const result = await listingService.getUserListings(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status
  });

  sendPaginated(res, result.listings, result.pagination, 'İlanlarınız getirildi');
});

/**
 * Get listings bought by user
 * GET /api/listings/my/bought
 */
const getMyPurchasedListings = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  
  const result = await listingService.getUserPurchasedListings(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20
  });

  sendPaginated(res, result.listings, result.pagination, 'Satın aldığınız ürünler getirildi');
});

/**
 * Get single listing
 * GET /api/listings/:id
 * Note: Access check is done in middleware
 */
const getListing = catchAsync(async (req, res) => {
  // Listing is already loaded by middleware
  const listing = req.listing;
  
  // Build response based on user role and ownership
  const data = listing.toPublicObject();
  
  // Include full seller info for owner or admin
  if (req.isListingOwner || req.user?.isAdmin()) {
    data.seller = {
      id: listing.seller.id,
      firstName: listing.seller.first_name,
      lastName: listing.seller.last_name,
      email: listing.seller.email,
      phone: listing.seller.phone
    };
  }

  // Include buyer info for sold listings (if viewer is seller/buyer/admin)
  if (listing.status === 'SOLD' && listing.buyer) {
    if (req.isListingOwner || req.isListingBuyer || req.user?.isAdmin()) {
      data.buyer = {
        id: listing.buyer.id,
        firstName: listing.buyer.first_name,
        lastName: listing.buyer.last_name
      };
    }
  }

  sendSuccess(res, { listing: data }, 'İlan detayları getirildi');
});

/**
 * Create new listing
 * POST /api/listings
 */
const createListing = catchAsync(async (req, res) => {
  const { title, description, price, category, condition, images } = req.body;
  
  const listing = await listingService.createListing(req.user.id, {
    title,
    description,
    price,
    category,
    condition,
    images
  });

  sendCreated(res, { listing }, SUCCESS_MESSAGES.LISTING_CREATED);
});

/**
 * Update listing
 * PUT /api/listings/:id
 * Note: Access and editability checks are done in middleware
 */
const updateListing = catchAsync(async (req, res) => {
  const { title, description, price, category, condition, images } = req.body;
  
  const listing = await listingService.updateListing(
    parseInt(req.params.id),
    req.user.id,
    { title, description, price, category, condition, images }
  );

  sendSuccess(res, { listing }, SUCCESS_MESSAGES.LISTING_UPDATED);
});

/**
 * Delete listing
 * DELETE /api/listings/:id
 */
const deleteListing = catchAsync(async (req, res) => {
  await listingService.deleteListing(parseInt(req.params.id), req.user.id);

  sendSuccess(res, null, SUCCESS_MESSAGES.LISTING_DELETED);
});

/**
 * Get user's listing statistics
 * GET /api/listings/my/stats
 */
const getMyListingStats = catchAsync(async (req, res) => {
  const stats = await listingService.getUserListingStats(req.user.id);

  sendSuccess(res, { stats }, 'İstatistikler getirildi');
});

module.exports = {
  getActiveListings,
  getMyListings,
  getMyPurchasedListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMyListingStats
};
