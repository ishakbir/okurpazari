/**
 * Validation Middleware
 * Handles express-validator results and sanitization
 */
const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { ERROR_MESSAGES } = require('../config/constants');

/**
 * Process validation results from express-validator
 * Returns first error or proceeds if valid
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Format errors for response
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return next(AppError.badRequest(ERROR_MESSAGES.VALIDATION_ERROR, formattedErrors));
  }
  
  next();
};

module.exports = validate;
