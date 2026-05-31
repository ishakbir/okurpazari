/**
 * Global Error Handler Middleware
 * Catches all errors and formats consistent responses
 */
const logger = require('../utils/logger');
const { sendError } = require('../utils/response');

/**
 * Development error response - includes stack trace
 */
const sendDevError = (err, res) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  return res.status(err.statusCode || 500).json({
    success: false,
    status: err.status || 'error',
    message: err.message,
    errors: err.errors || null,
    stack: err.stack
  });
};

/**
 * Production error response - hides sensitive info
 */
const sendProdError = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || null
    });
  }
  
  // Programming or unknown error: log and send generic message
  logger.error('UNEXPECTED ERROR:', err);
  
  return res.status(500).json({
    success: false,
    message: 'Bir hata oluştu, lütfen tekrar deneyin'
  });
};

/**
 * Handle specific error types
 */
const handleSequelizeValidationError = (err) => {
  // Log detailed error info
  logger.error('Sequelize Validation Error Details:', {
    errors: err.errors?.map(e => ({ path: e.path, message: e.message, value: e.value }))
  });
  
  const errors = err.errors.map(e => ({
    field: e.path,
    message: e.message
  }));
  
  const AppError = require('../utils/AppError');
  return AppError.badRequest('Girilen bilgilerde hata var', errors);
};

const handleSequelizeUniqueError = (err) => {
  const field = err.errors[0]?.path || 'field';
  const message = `Bu ${field} zaten kullanılıyor`;
  
  const AppError = require('../utils/AppError');
  return AppError.conflict(message);
};

const handleJWTError = () => {
  const AppError = require('../utils/AppError');
  return AppError.unauthorized('Geçersiz oturum');
};

const handleJWTExpiredError = () => {
  const AppError = require('../utils/AppError');
  return AppError.unauthorized('Oturum süresi doldu');
};

/**
 * Main error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log full error details
  logger.error('Full Error Details:', {
    name: err.name,
    message: err.message,
    original: err.original?.message,
    sql: err.sql,
    errors: err.errors
  });
  
  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific error types
  let error = { ...err, message: err.message };

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    error = handleSequelizeValidationError(err);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error = handleSequelizeUniqueError(err);
  }
  
  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const AppError = require('../utils/AppError');
    error = AppError.badRequest('İlişkili kayıt bulunamadı');
  }
  
  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    const AppError = require('../utils/AppError');
    logger.error('Database Error:', err.original?.message);
    error = AppError.badRequest('Veritabanı hatası: ' + (err.original?.message || 'Bilinmeyen hata'));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Send appropriate error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendDevError(error, res);
  } else {
    sendProdError(error, res);
  }
};

/**
 * 404 Handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
  const AppError = require('../utils/AppError');
  next(AppError.notFound(`${req.originalUrl} bulunamadı`));
};

module.exports = {
  errorHandler,
  notFoundHandler
};
