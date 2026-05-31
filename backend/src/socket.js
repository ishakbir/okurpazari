/**
 * Socket.io Handler
 * Real-time messaging and notifications
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');

let io = null;

// Store user socket mappings
const userSockets = new Map(); // userId -> Set of socketIds

/**
 * Initialize Socket.io with the HTTP server
 */
function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.debug(`Socket connected: User ${userId}, Socket ${socket.id}`);

    // Add socket to user's socket set
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle joining conversation rooms
    socket.on('join:conversation', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.debug(`User ${userId} joined conversation ${conversationId}`);
    });

    // Handle leaving conversation rooms
    socket.on('leave:conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      logger.debug(`User ${userId} left conversation ${conversationId}`);
    });

    // Handle typing indicator
    socket.on('typing:start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: true
      });
    });

    socket.on('typing:stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId,
        userId,
        isTyping: false
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: User ${userId}, Socket ${socket.id}`);
      
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

/**
 * Get the Socket.io instance
 */
function getIO() {
  return io;
}

/**
 * Check if a user is online
 */
function isUserOnline(userId) {
  return userSockets.has(userId) && userSockets.get(userId).size > 0;
}

/**
 * Emit a new message to conversation participants
 */
function emitNewMessage(conversationId, message, senderId, recipientId) {
  if (!io) return;

  // Emit to conversation room (for users with chat open)
  io.to(`conversation:${conversationId}`).emit('message:new', {
    conversationId,
    message
  });

  // Also emit to recipient's personal room (for notification update)
  io.to(`user:${recipientId}`).emit('message:notification', {
    conversationId,
    message,
    senderId
  });
}

/**
 * Emit message read status
 */
function emitMessagesRead(conversationId, readerId) {
  if (!io) return;

  io.to(`conversation:${conversationId}`).emit('messages:read', {
    conversationId,
    readerId
  });
}

/**
 * Emit a new notification to user
 */
function emitNotification(userId, notification) {
  if (!io) return;

  io.to(`user:${userId}`).emit('notification:new', notification);
}

module.exports = {
  initializeSocket,
  getIO,
  isUserOnline,
  emitNewMessage,
  emitMessagesRead,
  emitNotification
};
