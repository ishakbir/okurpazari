/**
 * Application Constants
 * Centralized enums and constant values
 */

// User roles
const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

// Listing statuses
const LISTING_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
  SOLD: 'SOLD'
};

// Admin action types
const ADMIN_ACTIONS = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  MARK_SOLD: 'MARK_SOLD',
  REVERT: 'REVERT'
};

// Notification types
const NOTIFICATION_TYPES = {
  LISTING_APPROVED: 'LISTING_APPROVED',
  LISTING_REJECTED: 'LISTING_REJECTED',
  LISTING_SOLD: 'LISTING_SOLD',
  ACCOUNT_STATUS: 'ACCOUNT_STATUS',
  SYSTEM: 'SYSTEM',
  // Q&A notifications
  NEW_QUESTION: 'NEW_QUESTION',
  QUESTION_ANSWERED: 'QUESTION_ANSWERED',
  // Purchase notifications
  PURCHASE_SUCCESS: 'PURCHASE_SUCCESS',
  PURCHASE_CREATED: 'PURCHASE_CREATED',
  ORDER_RECEIVED: 'ORDER_RECEIVED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_COMPLETED: 'ORDER_COMPLETED'
};

// Product conditions (Turkish)
const PRODUCT_CONDITIONS = {
  NEW: 'Sıfır',
  LIKE_NEW: 'Sıfır Gibi',
  LIGHTLY_USED: 'Az Kullanılmış',
  USED: 'Kullanılmış',
  WORN: 'Yıpranmış'
};

// Categories (Turkish) - Can be expanded
const CATEGORIES = [
  'Elektronik',
  'Telefon',
  'Bilgisayar',
  'Ev & Yaşam',
  'Giyim & Aksesuar',
  'Spor & Outdoor',
  'Kitap & Hobi',
  'Araç & Aksesuar',
  'Diğer'
];

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// Error messages (Turkish)
const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'E-posta veya şifre hatalı',
  EMAIL_EXISTS: 'Bu e-posta adresi zaten kullanılıyor',
  UNAUTHORIZED: 'Bu işlem için giriş yapmalısınız',
  FORBIDDEN: 'Bu işlem için yetkiniz yok',
  TOKEN_EXPIRED: 'Oturum süresi doldu, lütfen tekrar giriş yapın',
  INVALID_TOKEN: 'Geçersiz oturum',
  
  // User errors
  USER_NOT_FOUND: 'Kullanıcı bulunamadı',
  USER_INACTIVE: 'Hesabınız devre dışı bırakılmış',
  
  // Listing errors
  LISTING_NOT_FOUND: 'İlan bulunamadı',
  LISTING_ACCESS_DENIED: 'Bu ilana erişim izniniz yok',
  LISTING_NOT_EDITABLE: 'Bu ilan düzenlenemez',
  REJECTION_REASON_REQUIRED: 'Red nedeni belirtilmelidir',
  BUYER_REQUIRED: 'Alıcı bilgisi gereklidir',
  
  // Validation errors
  VALIDATION_ERROR: 'Girilen bilgilerde hata var',
  INVALID_EMAIL: 'Geçerli bir e-posta adresi girin',
  WEAK_PASSWORD: 'Şifre en az 8 karakter olmalı ve harf ile rakam içermelidir',
  
  // Server errors
  SERVER_ERROR: 'Bir hata oluştu, lütfen tekrar deneyin',
  RATE_LIMIT: 'Çok fazla istek gönderdiniz, lütfen bekleyin'
};

// Success messages (Turkish)
const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: 'Kayıt başarılı',
  LOGIN_SUCCESS: 'Giriş başarılı',
  LOGOUT_SUCCESS: 'Çıkış yapıldı',
  
  LISTING_CREATED: 'İlan oluşturuldu ve onay bekliyor',
  LISTING_UPDATED: 'İlan güncellendi',
  LISTING_DELETED: 'İlan silindi',
  LISTING_APPROVED: 'İlan onaylandı',
  LISTING_REJECTED: 'İlan reddedildi',
  LISTING_SOLD: 'İlan satıldı olarak işaretlendi',
  
  PROFILE_UPDATED: 'Profil güncellendi',
  PASSWORD_CHANGED: 'Şifre değiştirildi'
};

module.exports = {
  USER_ROLES,
  LISTING_STATUS,
  ADMIN_ACTIONS,
  NOTIFICATION_TYPES,
  PRODUCT_CONDITIONS,
  CATEGORIES,
  PAGINATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
