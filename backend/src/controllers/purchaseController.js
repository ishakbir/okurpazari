/**
 * Purchase Controller
 */
const purchaseService = require('../services/purchaseService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Create purchase with mock payment
 */
const createPurchase = catchAsync(async (req, res) => {
  const { listingId } = req.params;
  const { payment, shipping } = req.body;

  const purchase = await purchaseService.createPurchase(
    listingId,
    req.user.id,
    payment,
    shipping
  );

  sendCreated(res, 'Satın alma başarılı!', { purchase });
});

/**
 * Get my purchases (as buyer)
 */
const getMyPurchases = catchAsync(async (req, res) => {
  const result = await purchaseService.getBuyerPurchases(req.user.id, req.query);
  sendSuccess(res, result, 'Siparişleriniz getirildi');
});

/**
 * Get my sales (as seller)
 */
const getMySales = catchAsync(async (req, res) => {
  const result = await purchaseService.getSellerSales(req.user.id, req.query);
  sendSuccess(res, result, 'Satışlarınız getirildi');
});

/**
 * Get purchase details
 */
const getPurchaseById = catchAsync(async (req, res) => {
  const purchase = await purchaseService.getPurchaseById(
    req.params.id,
    req.user.id
  );
  sendSuccess(res, 'Sipariş detayları getirildi', { purchase });
});

/**
 * Mark as shipped (seller)
 */
const markAsShipped = catchAsync(async (req, res) => {
  const { carrier } = req.body;
  const purchase = await purchaseService.markAsShipped(
    req.params.id,
    req.user.id,
    carrier
  );
  sendSuccess(res, { purchase }, 'Sipariş kargoya verildi olarak işaretlendi');
});

/**
 * Mark as completed (buyer)
 */
const markAsCompleted = catchAsync(async (req, res) => {
  const purchase = await purchaseService.markAsCompleted(
    req.params.id,
    req.user.id
  );
  sendSuccess(res, 'Sipariş tamamlandı olarak işaretlendi', { purchase });
});

module.exports = {
  createPurchase,
  getMyPurchases,
  getMySales,
  getPurchaseById,
  markAsShipped,
  markAsCompleted
};
