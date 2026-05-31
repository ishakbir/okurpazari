/**
 * JWT Configuration
 * Token settings and secrets
 */
require('dotenv').config();

module.exports = {
  // Access token settings
  accessToken: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  },
  
  // Refresh token settings
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_me',
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    cookieName: 'refreshToken',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    }
  }
};
