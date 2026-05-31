/**
 * Conversation Controller
 * Handles direct messaging HTTP requests
 */
const conversationService = require('../services/conversationService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendCreated } = require('../utils/response');

/**
 * Get all conversations for authenticated user
 * GET /api/conversations
 */
const getConversations = catchAsync(async (req, res) => {
  const conversations = await conversationService.getUserConversations(req.user.id);
  sendSuccess(res, { conversations }, 'Konuşmalar listelendi');
});

/**
 * Get messages in a conversation
 * GET /api/conversations/:id/messages
 */
const getMessages = catchAsync(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const result = await conversationService.getMessages(
    parseInt(req.params.id),
    req.user.id,
    parseInt(page),
    parseInt(limit)
  );
  sendSuccess(res, result, 'Mesajlar getirildi');
});

/**
 * Send a message in a conversation
 * POST /api/conversations/:id/messages
 */
const sendMessage = catchAsync(async (req, res) => {
  const { content } = req.body;
  const message = await conversationService.sendMessage(
    parseInt(req.params.id),
    req.user.id,
    content
  );
  sendCreated(res, { message }, 'Mesaj gönderildi');
});

/**
 * Start a new conversation
 * POST /api/conversations/start
 */
const startConversation = catchAsync(async (req, res) => {
  const { sellerId, listingId, message } = req.body;
  const conversation = await conversationService.startConversation(
    req.user.id,
    sellerId,
    listingId,
    message
  );
  sendCreated(res, { conversation }, 'Konuşma başlatıldı');
});

/**
 * Get unread message count
 * GET /api/conversations/unread-count
 */
const getUnreadCount = catchAsync(async (req, res) => {
  const count = await conversationService.getUnreadCount(req.user.id);
  sendSuccess(res, { count }, 'Okunmamış mesaj sayısı');
});

/**
 * Get single conversation details
 * GET /api/conversations/:id
 */
const getConversation = catchAsync(async (req, res) => {
  const conversation = await conversationService.getConversationById(
    parseInt(req.params.id),
    req.user.id
  );
  sendSuccess(res, { conversation }, 'Konuşma detayları getirildi');
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  startConversation,
  getUnreadCount,
  getConversation
};
