/**
 * User Service
 * Business logic for user profile operations
 */
const { User } = require('../models');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../config/constants');

class UserService {
  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user.toSafeObject();
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw AppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const updateData = {};
    
    if (data.firstName !== undefined) {
      updateData.first_name = data.firstName;
    }
    
    if (data.lastName !== undefined) {
      updateData.last_name = data.lastName;
    }
    
    if (data.phone !== undefined) {
      updateData.phone = data.phone;
    }

    await user.update(updateData);
    await user.reload();

    return user.toSafeObject();
  }

  /**
   * Check if email is available
   */
  async isEmailAvailable(email, excludeUserId = null) {
    const where = { email };
    
    if (excludeUserId) {
      where.id = { [require('sequelize').Op.ne]: excludeUserId };
    }

    const existingUser = await User.findOne({ where });
    return !existingUser;
  }

  /**
   * Change user password
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

    // Update password (will be hashed by model hook)
    await user.update({ password_hash: newPassword });

    return { message: 'Şifre başarıyla değiştirildi' };
  }
}

module.exports = new UserService();

