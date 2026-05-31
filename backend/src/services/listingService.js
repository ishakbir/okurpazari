/**
 * Listing Service
 * Business logic for listing operations
 */
const { Op } = require('sequelize');
const { Listing, User } = require('../models');
const AppError = require('../utils/AppError');
const notificationService = require('./notificationService');
const { 
  LISTING_STATUS, 
  ERROR_MESSAGES, 
  PAGINATION,
  NOTIFICATION_TYPES 
} = require('../config/constants');

class ListingService {
  /**
   * Get all active (public) listings with pagination and filters
   */
  async getActiveListings({ page = 1, limit = 20, category, minPrice, maxPrice, search }) {
    const offset = (page - 1) * limit;
    limit = Math.min(limit, PAGINATION.MAX_LIMIT);

    // Build where clause
    const where = {
      status: LISTING_STATUS.ACTIVE
    };

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price[Op.gte] = minPrice;
      if (maxPrice !== undefined) where.price[Op.lte] = maxPrice;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Query listings
    const { rows: listings, count: totalItems } = await Listing.findAndCountAll({
      where,
      include: [{
        association: 'seller',
        attributes: ['id', 'first_name', 'last_name']
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      listings: listings.map(l => l.toPublicObject()),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    };
  }

  /**
   * Get user's own listings
   */
  async getUserListings(userId, { page = 1, limit = 20, status }) {
    const offset = (page - 1) * limit;
    limit = Math.min(limit, PAGINATION.MAX_LIMIT);

    const where = { seller_id: userId };
    
    if (status) {
      where.status = status;
    }

    const { rows: listings, count: totalItems } = await Listing.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      listings: listings.map(l => ({
        ...l.toPublicObject(false),
        rejectionReason: l.rejection_reason // Include for owner
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    };
  }

  /**
   * Get listings bought by user
   */
  async getUserPurchasedListings(userId, { page = 1, limit = 20 }) {
    const offset = (page - 1) * limit;
    limit = Math.min(limit, PAGINATION.MAX_LIMIT);

    const { rows: listings, count: totalItems } = await Listing.findAndCountAll({
      where: { 
        buyer_id: userId,
        status: LISTING_STATUS.SOLD
      },
      include: [{
        association: 'seller',
        attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
      }],
      order: [['sold_at', 'DESC']],
      limit,
      offset
    });

    return {
      listings: listings.map(l => ({
        ...l.toPublicObject(),
        seller: {
          id: l.seller.id,
          firstName: l.seller.first_name,
          lastName: l.seller.last_name,
          email: l.seller.email,
          phone: l.seller.phone
        }
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    };
  }

  /**
   * Get single listing by ID
   * Access check should be done in middleware
   */
  async getListingById(listingId) {
    const listing = await Listing.findByPk(listingId, {
      include: [
        {
          association: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          association: 'buyer',
          attributes: ['id', 'first_name', 'last_name']
        }
      ]
    });

    if (!listing) {
      throw AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    return listing;
  }

  /**
   * Create new listing
   */
  async createListing(userId, data) {
    const listing = await Listing.create({
      seller_id: userId,
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      condition: data.condition,
      images: data.images || [],
      status: LISTING_STATUS.PENDING
    });

    return listing.toPublicObject(false);
  }

  /**
   * Update listing
   * Only editable listings (PENDING or REJECTED) can be updated
   */
  async updateListing(listingId, userId, data) {
    const listing = await Listing.findByPk(listingId);

    if (!listing) {
      throw AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Verify ownership
    if (listing.seller_id !== userId) {
      throw AppError.forbidden(ERROR_MESSAGES.FORBIDDEN);
    }

    // Check if editable
    if (!listing.isEditable()) {
      throw AppError.badRequest(ERROR_MESSAGES.LISTING_NOT_EDITABLE);
    }

    // Update fields
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.images !== undefined) updateData.images = data.images;

    // If listing was rejected and is being edited, set back to pending
    if (listing.status === LISTING_STATUS.REJECTED) {
      updateData.status = LISTING_STATUS.PENDING;
      updateData.rejection_reason = null;
    }

    await listing.update(updateData);
    await listing.reload();

    return listing.toPublicObject(false);
  }

  /**
   * Delete listing
   * Only PENDING or REJECTED listings can be deleted by owner
   */
  async deleteListing(listingId, userId) {
    const listing = await Listing.findByPk(listingId);

    if (!listing) {
      throw AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND);
    }

    // Verify ownership
    if (listing.seller_id !== userId) {
      throw AppError.forbidden(ERROR_MESSAGES.FORBIDDEN);
    }

    // Check if deletable (only PENDING or REJECTED)
    if (!listing.isEditable()) {
      throw AppError.badRequest('Aktif veya satılmış ilanlar silinemez');
    }

    await listing.destroy();

    return true;
  }

  /**
   * Get listing statistics for a user
   */
  async getUserListingStats(userId) {
    const stats = await Listing.findAll({
      where: { seller_id: userId },
      attributes: [
        'status',
        [Listing.sequelize.fn('COUNT', Listing.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const result = {
      pending: 0,
      active: 0,
      rejected: 0,
      sold: 0,
      total: 0
    };

    stats.forEach(stat => {
      const status = stat.status.toLowerCase();
      result[status] = parseInt(stat.count);
      result.total += parseInt(stat.count);
    });

    return result;
  }
}

module.exports = new ListingService();
