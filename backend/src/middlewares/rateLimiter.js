/**
 * Rate Limiting Middleware
 * Protects against brute force and DoS attacks
 */
const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../config/constants');

/**
 * General API rate limiter
 * More permissive in development, stricter in production
 */
const isDev = process.env.NODE_ENV === 'development';
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : (parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100), // 1000 in dev
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(AppError.tooManyRequests(ERROR_MESSAGES.RATE_LIMIT));
  }
});

/**
 * Strict rate limiter for auth endpoints
 * 5 attempts per 15 minutes per IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 5,
  message: {
    success: false,
    message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
  handler: (req, res, next, options) => {
    next(AppError.tooManyRequests('Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.'));
  }
});

/**
 * Create listing rate limiter
 * 10 listings per hour per user
 */
const createListingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Saatte en fazla 10 ilan oluşturabilirsiniz.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user ? `user_${req.user.id}` : req.ip;
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  createListingLimiter
};
