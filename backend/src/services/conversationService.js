/**
 * Conversation Service
 * Business logic for direct messaging between users
 */
const { Op } = require('sequelize');
const { Conversation, DirectMessage, User, Listing } = require('../models');
const AppError = require('../utils/AppError');
const { emitNewMessage, emitMessagesRead } = require('../socket');

class ConversationService {
  /**
   * Get or create a conversation between two users
   */
  async getOrCreateConversation(userId, otherUserId, listingId = null) {
    // Ensure consistent ordering of participant IDs
    const [p1, p2] = [userId, otherUserId].sort((a, b) => a - b);

    // Look for existing conversation
    let conversation = await Conversation.findOne({
      where: {
        participant1_id: p1,
        participant2_id: p2,
        ...(listingId ? { listing_id: listingId } : {})
      }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participant1_id: p1,
        participant2_id: p2,
        listing_id: listingId
      });
    }

    return this.getConversationById(conversation.id, userId);
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId) {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant1_id: userId },
          { participant2_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'images']
        },
        {
          model: DirectMessage,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'first_name']
          }]
        }
      ],
      order: [['last_message_at', 'DESC']]
    });

    // Get unread counts for each conversation
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await DirectMessage.count({
          where: {
            conversation_id: conv.id,
            sender_id: { [Op.ne]: userId },
            is_read: false
          }
        });

        // Get the other participant
        const otherUser = conv.participant1_id === userId 
          ? conv.participant2 
          : conv.participant1;

        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            firstName: otherUser.first_name,
            lastName: otherUser.last_name
          },
          listing: conv.listing ? {
            id: conv.listing.id,
            title: conv.listing.title,
            image: conv.listing.images?.[0] || null
          } : null,
          lastMessage: conv.messages?.[0] ? {
            content: conv.messages[0].content,
            senderName: conv.messages[0].sender?.first_name,
            createdAt: conv.messages[0].createdAt
          } : null,
          unreadCount,
          updatedAt: conv.last_message_at || conv.createdAt
        };
      })
    );

    return result;
  }

  /**
   * Get a single conversation by ID
   */
  async getConversationById(conversationId, userId) {
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { participant1_id: userId },
          { participant2_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'participant1',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: User,
          as: 'participant2',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Listing,
          as: 'listing',
          attributes: ['id', 'title', 'images']
        }
      ]
    });

    if (!conversation) {
      throw new AppError('Konuşma bulunamadı veya erişim yetkiniz yok', 404);
    }

    const otherUser = conversation.participant1_id === userId 
      ? conversation.participant2 
      : conversation.participant1;

    return {
      id: conversation.id,
      otherUser: {
        id: otherUser.id,
        firstName: otherUser.first_name,
        lastName: otherUser.last_name
      },
      listing: conversation.listing ? {
        id: conversation.listing.id,
        title: conversation.listing.title,
        image: conversation.listing.images?.[0] || null
      } : null
    };
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId, userId, page = 1, limit = 50) {
    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { participant1_id: userId },
          { participant2_id: userId }
        ]
      }
    });

    if (!conversation) {
      throw new AppError('Konuşma bulunamadı veya erişim yetkiniz yok', 404);
    }

    // Mark messages as read
    const [updatedCount] = await DirectMessage.update(
      { is_read: true },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          is_read: false
        }
      }
    );

    // Emit read receipt if any messages were marked as read
    if (updatedCount > 0) {
      emitMessagesRead(conversationId, userId);
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await DirectMessage.findAndCountAll({
      where: { conversation_id: conversationId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'first_name', 'last_name']
      }],
      order: [['created_at', 'ASC']],
      limit,
      offset
    });

    return {
      messages: rows.map(msg => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.sender_id,
        senderName: `${msg.sender.first_name} ${msg.sender.last_name}`,
        isRead: msg.is_read,
        createdAt: msg.createdAt
      })),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        totalItems: count
      }
    };
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId, senderId, content) {
    // Verify sender is part of conversation
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
        [Op.or]: [
          { participant1_id: senderId },
          { participant2_id: senderId }
        ]
      }
    });

    if (!conversation) {
      throw new AppError('Konuşma bulunamadı veya erişim yetkiniz yok', 404);
    }

    const message = await DirectMessage.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim()
    });

    // Reload to get timestamps
    await message.reload();

    // Update conversation's last message timestamp
    await conversation.update({ last_message_at: new Date() });

    // Get sender info for socket emission
    const sender = await User.findByPk(senderId, { attributes: ['first_name', 'last_name'] });
    const senderName = `${sender.first_name} ${sender.last_name}`;

    // Determine recipient
    const recipientId = conversation.participant1_id === senderId 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    const messageData = {
      id: message.id,
      content: message.content,
      senderId: message.sender_id,
      senderName,
      isRead: message.is_read,
      createdAt: message.createdAt || new Date()
    };

    // Emit socket event for real-time delivery
    emitNewMessage(conversationId, messageData, senderId, recipientId);

    return messageData;
  }

  /**
   * Start a new conversation with a seller about a listing
   */
  async startConversation(userId, sellerId, listingId, initialMessage) {
    if (userId === sellerId) {
      throw new AppError('Kendinizle mesajlaşamazsınız', 400);
    }

    // Verify listing exists
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      throw new AppError('İlan bulunamadı', 404);
    }

    // Get or create conversation
    const conversation = await this.getOrCreateConversation(userId, sellerId, listingId);

    // Send initial message if provided
    if (initialMessage && initialMessage.trim()) {
      await this.sendMessage(conversation.id, userId, initialMessage);
    }

    return conversation;
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId) {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { participant1_id: userId },
          { participant2_id: userId }
        ]
      },
      attributes: ['id']
    });

    const conversationIds = conversations.map(c => c.id);
    
    if (conversationIds.length === 0) {
      return 0;
    }

    const count = await DirectMessage.count({
      where: {
        conversation_id: { [Op.in]: conversationIds },
        sender_id: { [Op.ne]: userId },
        is_read: false
      }
    });

    return count;
  }
}

module.exports = new ConversationService();
