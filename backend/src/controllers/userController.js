/**
 * User Controller
 * Handles user profile HTTP requests
 */
const userService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { SUCCESS_MESSAGES } = require('../config/constants');

/**
 * Get user profile
 * GET /api/users/profile
 */
const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  sendSuccess(res, { user }, 'Profil bilgileri getirildi');
});

/**
 * Update user profile
 * PUT /api/users/profile
 */
const updateProfile = catchAsync(async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  
  const user = await userService.updateProfile(req.user.id, {
    firstName,
    lastName,
    phone
  });

  sendSuccess(res, { user }, SUCCESS_MESSAGES.PROFILE_UPDATED);
});

/**
 * Change user password
 * POST /api/users/change-password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  await userService.changePassword(req.user.id, currentPassword, newPassword);

  sendSuccess(res, null, 'Şifre başarıyla değiştirildi');
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};

