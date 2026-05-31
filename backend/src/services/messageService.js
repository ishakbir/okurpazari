/**
 * Message Service
 * Handles Q&A for listings with visibility control
 */
const { Message, User, Listing } = require('../models');
const { Notification } = require('../models');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../config/constants');
const { Op } = require('sequelize');

class MessageService {
  /**
   * Get messages for a listing (with visibility filtering)
   * @param {number} listingId - Listing ID
   * @param {number|null} userId - Current user ID (null if not logged in)
   * @param {number|null} sellerId - Seller ID of the listing
   */
  async getListingMessages(listingId, userId = null, sellerId = null) {
    // Get all top-level questions with their replies
    const messages = await Message.findAll({
      where: { 
        listing_id: listingId,
        parent_id: null // Only questions
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Message,
          as: 'replies',
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'first_name', 'last_name']
          }],
          order: [['created_at', 'ASC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Filter messages based on visibility
    const filteredMessages = messages.filter(msg => {
      // Check if question is public (has a public reply)
      const hasPublicReply = msg.replies?.some(r => r.is_public);
      
      // Public questions (with public reply) are visible to everyone
      if (hasPublicReply) {
        return true;
      }
      
      // If user is not logged in, only show public Q&As
      if (!userId) {
        return false;
      }
      
      // Seller can see all questions on their listing
      if (userId === sellerId) {
        return true;
      }
      
      // Question asker can see their own questions
      if (msg.sender_id === userId) {
        return true;
      }
      
      return false;
    });

    // Also filter replies based on visibility
    return filteredMessages.map(msg => {
      const msgData = msg.toJSON();
      
      // Filter replies - only show public replies, or all if user is seller/asker
      if (userId === sellerId || msg.sender_id === userId) {
        // Seller and asker see all replies
        return msgData;
      }
      
      // Others only see public replies
      msgData.replies = msgData.replies?.filter(r => r.is_public) || [];
      return msgData;
    });
  }

  /**
   * Post a question on a listing (private by default)
   */
  async postQuestion(listingId, senderId, content) {
    // Check listing exists and is active
    const listing = await Listing.findByPk(listingId, {
      include: [{ model: User, as: 'seller', attributes: ['id'] }]
    });
    
    if (!listing) {
      throw new AppError(ERROR_MESSAGES.NOT_FOUND, 404);
    }

    if (listing.status !== 'ACTIVE') {
      throw new AppError('Bu ilanda soru sorulamaz', 400);
    }

    // Can't ask question on own listing
    if (listing.seller_id === senderId) {
      throw new AppError('Kendi ilanınızda soru soramazsınız', 400);
    }

    // Create question (private by default)
    const message = await Message.create({
      listing_id: listingId,
      sender_id: senderId,
      content: content.trim(),
      is_seller_reply: false,
      is_public: false // Questions are always private initially
    });

    // Notify seller
    await Notification.create({
      user_id: listing.seller_id,
      listing_id: listingId,
      type: 'NEW_QUESTION',
      title: 'Yeni Soru',
      message: `"${listing.title}" ilanınıza yeni bir soru soruldu.`
    });

    return message;
  }

  /**
   * Reply to a question (seller only)
   * @param {number} questionId - Question message ID
   * @param {number} sellerId - Seller user ID
   * @param {string} content - Reply content
   * @param {boolean} isPublic - Whether the reply (and question) should be public
   */
  async replyToQuestion(questionId, sellerId, content, isPublic = false) {
    const question = await Message.findByPk(questionId, {
      include: [{
        model: Listing,
        as: 'listing'
      }]
    });

    if (!question) {
      throw new AppError('Soru bulunamadı', 404);
    }

    // Only seller can reply
    if (question.listing.seller_id !== sellerId) {
      throw new AppError('Sadece satıcı yanıt verebilir', 403);
    }

    // Can only reply to top-level questions
    if (question.parent_id !== null) {
      throw new AppError('Sadece sorulara yanıt verilebilir', 400);
    }

    // Create reply with visibility setting
    const reply = await Message.create({
      listing_id: question.listing_id,
      sender_id: sellerId,
      parent_id: questionId,
      content: content.trim(),
      is_seller_reply: true,
      is_public: isPublic
    });

    // Notify question asker
    await Notification.create({
      user_id: question.sender_id,
      listing_id: question.listing_id,
      type: 'QUESTION_ANSWERED',
      title: 'Sorunuz Yanıtlandı',
      message: `"${question.listing.title}" ilanına sorduğunuz soru yanıtlandı.`
    });

    return reply;
  }
}

module.exports = new MessageService();
