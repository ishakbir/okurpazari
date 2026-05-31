/**
 * Authentication Service
 * Business logic for authentication operations
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const jwtConfig = require('../config/jwt');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES, USER_ROLES } = require('../config/constants');

class AuthService {
  /**
   * Generate JWT access token
   */
  generateAccessToken(userId) {
    return jwt.sign(
      { userId },
      jwtConfig.accessToken.secret,
      { expiresIn: jwtConfig.accessToken.expiresIn }
    );
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      jwtConfig.refreshToken.secret,
      { expiresIn: jwtConfig.refreshToken.expiresIn }
    );
  }

  /**
   * Generate both tokens
   */
  generateTokens(userId) {
    return {
      accessToken: this.generateAccessToken(userId),
      refreshToken: this.generateRefreshToken(userId)
    };
  }

  /**
   * Register a new user
   */
  async register({ email, password, firstName, lastName, phone }) {
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw AppError.conflict(ERROR_MESSAGES.EMAIL_EXISTS);
    }

    // Create user (password will be hashed by model hook)
    const user = await User.create({
      email,
      password_hash: password,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role: USER_ROLES.USER,
      is_active: true
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: user.toSafeObject(),
      ...tokens
    };
  }

  /**
   * Login user
   */
  async login({ email, password }) {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      throw AppError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Check if account is active
    if (!user.is_active) {
      throw AppError.forbidden(ERROR_MESSAGES.USER_INACTIVE);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw AppError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Update last login
    await user.update({ last_login_at: new Date() });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: user.toSafeObject(),
      ...tokens
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw AppError.unauthorized(ERROR_MESSAGES.INVALID_TOKEN);
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshToken.secret);
      
      // Find user
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        throw AppError.unauthorized(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      if (!user.is_active) {
        throw AppError.forbidden(ERROR_MESSAGES.USER_INACTIVE);
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user.id);

      return {
        accessToken,
        user: user.toSafeObject()
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AppError.unauthorized('Oturum süresi doldu, lütfen tekrar giriş yapın');
      }
      if (error.isOperational) {
        throw error;
      }
      throw AppError.unauthorized(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user.toSafeObject();
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw AppError.badRequest('Mevcut şifre hatalı');
    }

    // Update password
    await user.update({ password_hash: newPassword });

    return true;
  }
}

module.exports = new AuthService();
