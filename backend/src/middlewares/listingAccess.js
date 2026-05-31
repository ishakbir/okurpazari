/**
 * Listing Access Middleware
 * Enforces visibility rules for listings based on status and user role
 */
const { Listing } = require('../models');
const AppError = require('../utils/AppError');
const { LISTING_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * Load listing and check access permissions
 * Attaches listing to req.listing if authorized
 * Supports both numeric ID and slug parameter
 */
const checkListingAccess = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    
    // Determine if identifier is numeric ID or slug
    const isNumericId = /^\d+$/.test(identifier);
    
    // Build query based on identifier type
    const whereClause = isNumericId 
      ? { id: parseInt(identifier) } 
      : { slug: identifier };
    
    // Load listing with seller info
    const listing = await Listing.findOne({
      where: whereClause,
      include: [
        {
          association: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email']
        },
        {
          association: 'buyer',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    if (!listing) {
      return next(AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND));
    }

    // Get user info (may be null for unauthenticated requests)
    const userId = req.user?.id || null;
    const userRole = req.user?.role || null;

    // Check access using listing's method
    if (!listing.canBeViewedBy(userId, userRole)) {
      // Special message for SOLD listings
      if (listing.status === LISTING_STATUS.SOLD) {
        return next(AppError.forbidden('Bu ilan satılmış ve sadece alıcı ile satıcı tarafından görüntülenebilir'));
      }
      return next(AppError.forbidden(ERROR_MESSAGES.LISTING_ACCESS_DENIED));
    }

    // Attach listing and access info to request
    req.listing = listing;
    req.isListingOwner = userId && listing.seller_id === userId;
    req.isListingBuyer = userId && listing.buyer_id === userId;
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if listing can be edited
 * Only PENDING or REJECTED listings can be edited by owner
 */
const checkListingEditable = (req, res, next) => {
  const listing = req.listing;
  
  if (!listing) {
    return next(AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND));
  }

  // Only owner can edit
  if (!req.isListingOwner) {
    return next(AppError.forbidden(ERROR_MESSAGES.FORBIDDEN));
  }

  // Check if listing is in editable state
  if (!listing.isEditable()) {
    return next(AppError.badRequest(ERROR_MESSAGES.LISTING_NOT_EDITABLE));
  }

  next();
};

/**
 * Check if listing can be moderated (admin only)
 */
const checkListingModeratable = (req, res, next) => {
  const listing = req.listing;
  
  if (!listing) {
    return next(AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND));
  }

  // Already checked in roleGuard, just verify listing exists
  next();
};

module.exports = {
  checkListingAccess,
  checkListingEditable,
  checkListingModeratable
};
