/**
 * Admin Service
 * Business logic for admin moderation operations
 */
const { Op } = require('sequelize');
const { Listing, User, AdminAction, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const notificationService = require('./notificationService');
const { 
  LISTING_STATUS, 
  ADMIN_ACTIONS,
  ERROR_MESSAGES, 
  PAGINATION,
  NOTIFICATION_TYPES 
} = require('../config/constants');

class AdminService {
  /**
   * Get all listings for admin (any status)
   */
  async getAllListings({ page = 1, limit = 20, status, search }) {
    const offset = (page - 1) * limit;
    limit = Math.min(limit, PAGINATION.MAX_LIMIT);

    const where = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { id: isNaN(search) ? null : parseInt(search) }
      ].filter(Boolean);
    }

    const { rows: listings, count: totalItems } = await Listing.findAndCountAll({
      where,
      include: [{
        association: 'seller',
        attributes: ['id', 'first_name', 'last_name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      listings: listings.map(l => ({
        id: l.id,
        title: l.title,
        price: parseFloat(l.price),
        category: l.category,
        status: l.status,
        rejectionReason: l.rejection_reason,
        createdAt: l.created_at,
        seller: {
          id: l.seller.id,
          name: `${l.seller.first_name} ${l.seller.last_name}`,
          email: l.seller.email
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
   * Get pending listings for moderation
   */
  async getPendingListings({ page = 1, limit = 20 }) {
    return this.getAllListings({ page, limit, status: LISTING_STATUS.PENDING });
  }

  /**
   * Approve a listing
   */
  async approveListing(listingId, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const listing = await Listing.findByPk(listingId, { transaction });

      if (!listing) {
        throw AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND);
      }

      // Store previous state for audit
      const previousState = {
        status: listing.status,
        rejection_reason: listing.rejection_reason
      };

      // Update listing
      await listing.update({
        status: LISTING_STATUS.ACTIVE,
        rejection_reason: null
      }, { transaction });

      // Create audit log
      await AdminAction.create({
        admin_id: adminId,
        listing_id: listingId,
        action: ADMIN_ACTIONS.APPROVE,
        previous_state: previousState
      }, { transaction });

      // Send notification to seller
      await notificationService.createNotification({
        userId: listing.seller_id,
        listingId: listing.id,
        type: NOTIFICATION_TYPES.LISTING_APPROVED,
        title: 'İlanınız Onaylandı',
        message: `"${listing.title}" başlıklı ilanınız onaylandı ve yayına alındı.`
      }, transaction);

      await transaction.commit();

      await listing.reload({
        include: [{
          association: 'seller',
          attributes: ['id', 'first_name', 'last_name']
        }]
      });

      return listing.toPublicObject();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Reject a listing with reason
   */
  async rejectListing(listingId, adminId, reason) {
    if (!reason || reason.trim().length < 10) {
      throw AppError.badRequest(ERROR_MESSAGES.REJECTION_REASON_REQUIRED);
    }

    const transaction = await sequelize.transaction();

    try {
      const listing = await Listing.findByPk(listingId, { transaction });

      if (!listing) {
        throw AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND);
      }

      // Store previous state for audit
      const previousState = {
        status: listing.status,
        rejection_reason: listing.rejection_reason
      };

      // Update listing
      await listing.update({
        status: LISTING_STATUS.REJECTED,
        rejection_reason: reason.trim()
      }, { transaction });

      // Create audit log
      await AdminAction.create({
        admin_id: adminId,
        listing_id: listingId,
        action: ADMIN_ACTIONS.REJECT,
        reason: reason.trim(),
        previous_state: previousState
      }, { transaction });

      // Send notification to seller
      await notificationService.createNotification({
        userId: listing.seller_id,
        listingId: listing.id,
        type: NOTIFICATION_TYPES.LISTING_REJECTED,
        title: 'İlanınız Reddedildi',
        message: `"${listing.title}" başlıklı ilanınız reddedildi.\n\nRed nedeni: ${reason.trim()}\n\nİlanınızı düzenleyerek tekrar gönderebilirsiniz.`
      }, transaction);

      await transaction.commit();

      await listing.reload();

      return {
        id: listing.id,
        status: listing.status,
        rejectionReason: listing.rejection_reason
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Mark listing as sold
   */
  async markListingSold(listingId, adminId, buyerId) {
    if (!buyerId) {
      throw AppError.badRequest(ERROR_MESSAGES.BUYER_REQUIRED);
    }

    const transaction = await sequelize.transaction();

    try {
      const listing = await Listing.findByPk(listingId, { transaction });

      if (!listing) {
        throw AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND);
      }

      // Verify buyer exists
      const buyer = await User.findByPk(buyerId, { transaction });
      if (!buyer) {
        throw AppError.badRequest('Alıcı bulunamadı');
      }

      // Buyer cannot be the seller
      if (buyerId === listing.seller_id) {
        throw AppError.badRequest('Satıcı kendi ilanını satın alamaz');
      }

      // Store previous state for audit
      const previousState = {
        status: listing.status,
        buyer_id: listing.buyer_id,
        sold_at: listing.sold_at
      };

      // Update listing
      await listing.update({
        status: LISTING_STATUS.SOLD,
        buyer_id: buyerId,
        sold_at: new Date()
      }, { transaction });

      // Create audit log
      await AdminAction.create({
        admin_id: adminId,
        listing_id: listingId,
        action: ADMIN_ACTIONS.MARK_SOLD,
        previous_state: previousState
      }, { transaction });

      // Notify seller
      await notificationService.createNotification({
        userId: listing.seller_id,
        listingId: listing.id,
        type: NOTIFICATION_TYPES.LISTING_SOLD,
        title: 'İlanınız Satıldı',
        message: `"${listing.title}" başlıklı ilanınız satıldı olarak işaretlendi.`
      }, transaction);

      // Notify buyer
      await notificationService.createNotification({
        userId: buyerId,
        listingId: listing.id,
        type: NOTIFICATION_TYPES.LISTING_SOLD,
        title: 'Satın Alma Onaylandı',
        message: `"${listing.title}" başlıklı ürünü satın aldınız.`
      }, transaction);

      await transaction.commit();

      await listing.reload();

      return {
        id: listing.id,
        status: listing.status,
        buyerId: listing.buyer_id,
        soldAt: listing.sold_at
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Revert listing to previous status
   */
  async revertListing(listingId, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const listing = await Listing.findByPk(listingId, { transaction });

      if (!listing) {
        throw AppError.notFound(ERROR_MESSAGES.LISTING_NOT_FOUND);
      }

      // Get last admin action for this listing
      const lastAction = await AdminAction.findOne({
        where: { listing_id: listingId },
        order: [['created_at', 'DESC']],
        transaction
      });

      if (!lastAction || !lastAction.previous_state) {
        throw AppError.badRequest('Geri alınacak işlem bulunamadı');
      }

      const previousState = {
        status: listing.status,
        rejection_reason: listing.rejection_reason,
        buyer_id: listing.buyer_id,
        sold_at: listing.sold_at
      };

      // Restore previous state
      await listing.update({
        status: lastAction.previous_state.status || LISTING_STATUS.PENDING,
        rejection_reason: lastAction.previous_state.rejection_reason || null,
        buyer_id: lastAction.previous_state.buyer_id || null,
        sold_at: lastAction.previous_state.sold_at || null
      }, { transaction });

      // Create audit log for revert
      await AdminAction.create({
        admin_id: adminId,
        listing_id: listingId,
        action: ADMIN_ACTIONS.REVERT,
        reason: 'İşlem geri alındı',
        previous_state: previousState
      }, { transaction });

      await transaction.commit();

      await listing.reload();

      return listing.toPublicObject(false);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get all users for admin
   */
  async getAllUsers({ page = 1, limit = 20, search, role }) {
    const offset = (page - 1) * limit;
    limit = Math.min(limit, PAGINATION.MAX_LIMIT);

    const where = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows: users, count: totalItems } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      users: users.map(u => u.toSafeObject()),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    };
  }

  /**
   * Update user active status
   */
  async updateUserStatus(userId, isActive, adminId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Cannot deactivate self
    if (userId === adminId) {
      throw AppError.badRequest('Kendi hesabınızı devre dışı bırakamazsınız');
    }

    await user.update({ is_active: isActive });

    // Notify user
    await notificationService.createNotification({
      userId: user.id,
      type: NOTIFICATION_TYPES.ACCOUNT_STATUS,
      title: isActive ? 'Hesabınız Aktifleştirildi' : 'Hesabınız Devre Dışı Bırakıldı',
      message: isActive 
        ? 'Hesabınız tekrar aktif edildi. Platformu kullanmaya devam edebilirsiniz.'
        : 'Hesabınız yönetici tarafından devre dışı bırakıldı. Detaylar için iletişime geçin.'
    });

    return user.toSafeObject();
  }

  /**
   * Get admin action history
   */
  async getActionHistory({ page = 1, limit = 20, adminId, listingId }) {
    const offset = (page - 1) * limit;
    limit = Math.min(limit, PAGINATION.MAX_LIMIT);

    const where = {};

    if (adminId) {
      where.admin_id = adminId;
    }

    if (listingId) {
      where.listing_id = listingId;
    }

    const { rows: actions, count: totalItems } = await AdminAction.findAndCountAll({
      where,
      include: [
        {
          association: 'admin',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          association: 'listing',
          attributes: ['id', 'title']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      actions: actions.map(a => a.toLogObject()),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [listingStats, userStats] = await Promise.all([
      Listing.findAll({
        attributes: [
          'status',
          [Listing.sequelize.fn('COUNT', Listing.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      }),
      User.count({ where: { role: 'USER' } })
    ]);

    const stats = {
      listings: {
        pending: 0,
        active: 0,
        rejected: 0,
        sold: 0,
        total: 0
      },
      users: {
        total: userStats
      }
    };

    listingStats.forEach(stat => {
      const status = stat.status.toLowerCase();
      stats.listings[status] = parseInt(stat.count);
      stats.listings.total += parseInt(stat.count);
    });

    return stats;
  }
}

module.exports = new AdminService();
