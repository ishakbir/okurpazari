/**
 * Authentication Controller
 * Handles auth-related HTTP requests
 */
const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendCreated } = require('../utils/response');
const jwtConfig = require('../config/jwt');
const { SUCCESS_MESSAGES } = require('../config/constants');

/**
 * Register new user
 * POST /api/auth/register
 */
const register = catchAsync(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  
  const result = await authService.register({
    email,
    password,
    firstName,
    lastName,
    phone
  });

  // Set refresh token as httpOnly cookie
  res.cookie(
    jwtConfig.refreshToken.cookieName,
    result.refreshToken,
    jwtConfig.refreshToken.cookieOptions
  );

  sendCreated(res, {
    user: result.user,
    accessToken: result.accessToken
  }, SUCCESS_MESSAGES.REGISTER_SUCCESS);
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  const result = await authService.login({ email, password });

  // Set refresh token as httpOnly cookie
  res.cookie(
    jwtConfig.refreshToken.cookieName,
    result.refreshToken,
    jwtConfig.refreshToken.cookieOptions
  );

  sendSuccess(res, {
    user: result.user,
    accessToken: result.accessToken
  }, SUCCESS_MESSAGES.LOGIN_SUCCESS);
});

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = catchAsync(async (req, res) => {
  const token = req.cookies[jwtConfig.refreshToken.cookieName];
  
  const result = await authService.refreshToken(token);

  sendSuccess(res, {
    accessToken: result.accessToken,
    user: result.user
  }, 'Token yenilendi');
});

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = catchAsync(async (req, res) => {
  // Clear refresh token cookie
  res.clearCookie(jwtConfig.refreshToken.cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  sendSuccess(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
});

/**
 * Get current user
 * GET /api/auth/me
 */
const getMe = catchAsync(async (req, res) => {
  const user = await authService.getUserById(req.user.id);

  sendSuccess(res, { user }, 'Kullanıcı bilgileri getirildi');
});

/**
 * Change password
 * PUT /api/auth/password
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  sendSuccess(res, null, SUCCESS_MESSAGES.PASSWORD_CHANGED);
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword
};
