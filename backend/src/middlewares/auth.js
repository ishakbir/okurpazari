/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../config/constants');

/**
 * Verify access token and attach user to request
 * Required authentication - blocks unauthenticated requests
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.accessToken.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(AppError.unauthorized(ERROR_MESSAGES.TOKEN_EXPIRED));
      }
      return next(AppError.unauthorized(ERROR_MESSAGES.INVALID_TOKEN));
    }

    // Find user
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return next(AppError.unauthorized(ERROR_MESSAGES.USER_NOT_FOUND));
    }

    if (!user.is_active) {
      return next(AppError.forbidden(ERROR_MESSAGES.USER_INACTIVE));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - allows unauthenticated requests
 * but attaches user if valid token is present
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, jwtConfig.accessToken.secret);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Token invalid or expired, continue without user
      req.user = null;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
