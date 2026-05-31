/**
 * Custom Application Error Class
 * Extends Error with HTTP status code and operational flag
 */
class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Distinguishes operational errors from programming errors
    this.errors = errors; // For validation errors array
    
    Error.captureStackTrace(this, this.constructor);
  }
  
  // Factory methods for common errors
  static badRequest(message, errors = null) {
    return new AppError(message, 400, errors);
  }
  
  static unauthorized(message = 'Yetkisiz erişim') {
    return new AppError(message, 401);
  }
  
  static forbidden(message = 'Bu işlem için yetkiniz yok') {
    return new AppError(message, 403);
  }
  
  static notFound(message = 'Kayıt bulunamadı') {
    return new AppError(message, 404);
  }
  
  static conflict(message = 'Çakışma hatası') {
    return new AppError(message, 409);
  }
  
  static tooManyRequests(message = 'Çok fazla istek') {
    return new AppError(message, 429);
  }
  
  static internal(message = 'Sunucu hatası') {
    return new AppError(message, 500);
  }
}

module.exports = AppError;
