/**
 * Server Entry Point
 * Starts the Express server with database connection and Socket.io
 */
require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const { testConnection, syncDatabase } = require('./src/models');
const { initializeSocket } = require('./src/socket');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  logger.info(`${signal} alındı, sunucu kapatılıyor...`);
  server.close(() => {
    logger.info('HTTP sunucusu kapatıldı');
    process.exit(0);
  });
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Yakalanmamış Hata:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('İşlenmemiş Promise Reddi:', reason);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database (creates tables if not exist)
    // In production, use migrations instead
    if (process.env.NODE_ENV === 'development') {
      await syncDatabase(false); // false = don't drop existing tables
    }
    
    // Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 Sunucu ${PORT} portunda çalışıyor`);
      logger.info(`📍 Ortam: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API: http://localhost:${PORT}/api/health`);
      logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Sunucu başlatılamadı:', error);
    process.exit(1);
  }
};

startServer();
