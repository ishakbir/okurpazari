/**
 * Role Guard Middleware
 * Role-based access control for protected routes
 */
const AppError = require('../utils/AppError');
const { USER_ROLES, ERROR_MESSAGES } = require('../config/constants');

/**
 * Check if user has required role(s)
 * @param  {...string} allowedRoles - Roles allowed to access the route
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // User must be authenticated first
    if (!req.user) {
      return next(AppError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED));
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden(ERROR_MESSAGES.FORBIDDEN));
    }

    next();
  };
};

/**
 * Require admin role
 */
const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Require regular user role
 */
const requireUser = requireRole(USER_ROLES.USER);

/**
 * Allow any authenticated user (both USER and ADMIN)
 */
const requireAnyRole = requireRole(USER_ROLES.USER, USER_ROLES.ADMIN);

/**
 * Check if user owns the resource or is admin
 * Generic ownership check - must be used after loading resource
 * @param {Function} getOwnerId - Function to extract owner ID from request
 */
const requireOwnerOrAdmin = (getOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized(ERROR_MESSAGES.UNAUTHORIZED));
    }

    const ownerId = getOwnerId(req);
    const isOwner = req.user.id === ownerId;
    const isAdmin = req.user.role === USER_ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return next(AppError.forbidden(ERROR_MESSAGES.FORBIDDEN));
    }

    req.isOwner = isOwner;
    req.isAdmin = isAdmin;
    next();
  };
};

module.exports = {
  requireRole,
  requireAdmin,
  requireUser,
  requireAnyRole,
  requireOwnerOrAdmin
};
