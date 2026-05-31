/**
 * Purchase Service
 * Handles order creation and mock payment
 */
const { Purchase, Listing, User, Notification, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES, LISTING_STATUS } = require('../config/constants');

class PurchaseService {
  /**
   * Create purchase with mock payment
   */
  async createPurchase(listingId, buyerId, paymentData, shippingData) {
    const transaction = await sequelize.transaction();

    try {
      // Get listing
      const listing = await Listing.findByPk(listingId, {
        include: [{ model: User, as: 'seller', attributes: ['id', 'first_name', 'last_name'] }],
        transaction
      });

      if (!listing) {
        throw new AppError(ERROR_MESSAGES.NOT_FOUND, 404);
      }

      if (listing.status !== LISTING_STATUS.ACTIVE) {
        throw new AppError('Bu ilan satın alınamaz', 400);
      }

      // Can't buy own listing
      if (listing.seller_id === buyerId) {
        throw new AppError('Kendi ilanınızı satın alamazsınız', 400);
      }

      // Mock payment validation - always succeeds
      // In real app, integrate with payment gateway here
      const lastFour = paymentData.cardNumber.slice(-4);

      // Create purchase
      const purchase = await Purchase.create({
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        amount: listing.price,
        status: 'PAID',
        payment_method: 'credit_card',
        payment_last_four: lastFour,
        shipping_name: shippingData.name,
        shipping_address: shippingData.address,
        shipping_phone: shippingData.phone,
        paid_at: new Date()
      }, { transaction });

      // Update listing status to SOLD
      await listing.update({
        status: LISTING_STATUS.SOLD,
        buyer_id: buyerId,
        sold_at: new Date()
      }, { transaction });

      // Notify seller
      await Notification.create({
        user_id: listing.seller_id,
        listing_id: listingId,
        type: 'LISTING_SOLD',
        title: 'İlanınız Satıldı!',
        message: `"${listing.title}" başlıklı ilanınız satıldı. Kargo gönderimini yapınız.`
      }, { transaction });

      // Notify buyer
      await Notification.create({
        user_id: buyerId,
        listing_id: listingId,
        type: 'PURCHASE_SUCCESS',
        title: 'Satın Alma Başarılı',
        message: `"${listing.title}" başlıklı ürünü başarıyla satın aldınız.`
      }, { transaction });

      await transaction.commit();

      return purchase;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get buyer's purchases
   */
  async getBuyerPurchases(buyerId, pagination) {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Purchase.findAndCountAll({
      where: { buyer_id: buyerId },
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price', 'images']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      items: rows,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalItems: count
      }
    };
  }

  /**
   * Get seller's sales
   */
  async getSellerSales(sellerId, pagination) {
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Purchase.findAndCountAll({
      where: { seller_id: sellerId },
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price', 'images']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      items: rows,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalItems: count
      }
    };
  }

  /**
   * Get purchase by ID
   */
  async getPurchaseById(purchaseId, userId) {
    const purchase = await Purchase.findByPk(purchaseId, {
      include: [
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'price', 'images', 'description']
        },
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
        }
      ]
    });

    if (!purchase) {
      throw new AppError('Sipariş bulunamadı', 404);
    }

    // Only buyer or seller can view
    if (purchase.buyer_id !== userId && purchase.seller_id !== userId) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, 403);
    }

    return purchase;
  }

  /**
   * Update shipping status (seller only)
   * @param {number} purchaseId - Purchase ID
   * @param {number} sellerId - Seller user ID
   * @param {string} carrier - Shipping carrier (PTT, Yurtiçi, MNG, Aras, Sürat)
   */
  async markAsShipped(purchaseId, sellerId, carrier) {
    const purchase = await Purchase.findByPk(purchaseId, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!purchase) {
      throw new AppError('Sipariş bulunamadı', 404);
    }

    if (purchase.seller_id !== sellerId) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, 403);
    }

    if (purchase.status !== 'PAID') {
      throw new AppError('Sadece ödenen siparişler kargoya verilebilir', 400);
    }

    // Validate carrier
    const validCarriers = ['PTT', 'Yurtiçi', 'MNG', 'Aras', 'Sürat'];
    if (!carrier || !validCarriers.includes(carrier)) {
      throw new AppError('Geçerli bir kargo firması seçin', 400);
    }

    // Generate barcode: Carrier prefix + timestamp + random digits
    const carrierPrefixes = {
      'PTT': 'PT',
      'Yurtiçi': 'YK',
      'MNG': 'MN',
      'Aras': 'AR',
      'Sürat': 'SK'
    };
    const prefix = carrierPrefixes[carrier];
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const barcode = `${prefix}${timestamp}${random}`;

    await purchase.update({
      status: 'SHIPPED',
      shipped_at: new Date(),
      shipping_carrier: carrier,
      shipping_barcode: barcode
    });

    // Notify buyer
    await Notification.create({
      user_id: purchase.buyer_id,
      listing_id: purchase.listing_id,
      type: 'ORDER_SHIPPED',
      title: 'Siparişiniz Kargoya Verildi',
      message: `"${purchase.listing.title}" siparişiniz ${carrier} Kargo ile kargoya verildi. Takip No: ${barcode}`
    });

    return purchase;
  }

  /**
   * Mark order as completed (buyer confirms receipt)
   */
  async markAsCompleted(purchaseId, buyerId) {
    const purchase = await Purchase.findByPk(purchaseId, {
      include: [{ model: Listing, as: 'listing' }]
    });

    if (!purchase) {
      throw new AppError('Sipariş bulunamadı', 404);
    }

    if (purchase.buyer_id !== buyerId) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, 403);
    }

    if (purchase.status !== 'SHIPPED') {
      throw new AppError('Sadece kargoya verilen siparişler tamamlanabilir', 400);
    }

    await purchase.update({
      status: 'COMPLETED',
      completed_at: new Date()
    });

    // Notify seller
    await Notification.create({
      user_id: purchase.seller_id,
      listing_id: purchase.listing_id,
      type: 'ORDER_COMPLETED',
      title: 'Sipariş Tamamlandı',
      message: `"${purchase.listing.title}" siparişi alıcı tarafından teslim alındı.`
    });

    return purchase;
  }
}

module.exports = new PurchaseService();
