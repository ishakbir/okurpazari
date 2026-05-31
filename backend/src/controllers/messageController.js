/**
 * Message Controller
 * Handles Q&A API requests
 */
const messageService = require('../services/messageService');
const { sendSuccess } = require('../utils/response');
const { Listing } = require('../models');

class MessageController {
  /**
   * Get messages for a listing
   */
  async getListingMessages(req, res, next) {
    try {
      const { listingId } = req.params;
      const userId = req.user?.id || null;
      
      // Get listing to find seller
      const listing = await Listing.findByPk(listingId);
      const sellerId = listing?.seller_id || null;
      
      const messages = await messageService.getListingMessages(listingId, userId, sellerId);
      sendSuccess(res, { messages });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Post a question on a listing
   */
  async postQuestion(req, res, next) {
    try {
      const { listingId } = req.params;
      const { content } = req.body;
      const senderId = req.user.id;

      const message = await messageService.postQuestion(listingId, senderId, content);
      sendSuccess(res, { message }, 'Sorunuz gönderildi', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reply to a question (seller only)
   */
  async replyToQuestion(req, res, next) {
    try {
      const { questionId } = req.params;
      const { content, isPublic } = req.body;
      const sellerId = req.user.id;

      const reply = await messageService.replyToQuestion(
        questionId, 
        sellerId, 
        content, 
        isPublic === true // Convert to boolean
      );
      sendSuccess(res, { reply }, 'Yanıtınız gönderildi', 201);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
