/**
 * TypeScript Type Definitions
 * Shared types for the application
 */

// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  profileImage?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

// Listing types
export type ListingStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SOLD';

export interface Seller {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

export interface Listing {
  id: number;
  slug?: string;
  listingNumber?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: ListingStatus;
  rejectionReason?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
  seller?: Seller;
  buyer?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images?: string[];
}

// Notification types
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  listingId?: number;
  createdAt: string;
}

// Message types (Q&A)
export interface MessageSender {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Message {
  id: number;
  listingId: number;
  senderId: number;
  parentId?: number;
  content: string;
  isSellerReply: boolean;
  isPublic: boolean;
  createdAt: string;
  sender?: MessageSender;
  replies?: Message[];
}

// Purchase types
export type PurchaseStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface Purchase {
  id: number;
  listingId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  status: PurchaseStatus;
  paymentMethod: string;
  paymentLastFour?: string;
  shippingName?: string;
  shippingAddress?: string;
  shippingPhone?: string;
  shipping_carrier?: string;
  shipping_barcode?: string;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
  createdAt: string;
  listing?: Listing;
  buyer?: Seller;
  seller?: Seller;
}

export interface PaymentData {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

export interface ShippingData {
  name: string;
  address: string;
  phone: string;
}

// Pagination types
export interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: Pagination;
  };
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Admin types
export interface AdminListingItem {
  id: number;
  title: string;
  price: number;
  category: string;
  status: ListingStatus;
  rejectionReason?: string;
  createdAt: string;
  seller: {
    id: number;
    name: string;
    email: string;
  };
}

export interface DashboardStats {
  listings: {
    pending: number;
    active: number;
    rejected: number;
    sold: number;
    total: number;
  };
  users: {
    total: number;
  };
}

// Constants
export const CATEGORIES = [
  'Elektronik',
  'Telefon',
  'Bilgisayar',
  'Ev & Yaşam',
  'Giyim & Aksesuar',
  'Spor & Outdoor',
  'Kitap & Hobi',
  'Araç & Aksesuar',
  'Diğer'
] as const;

export const PRODUCT_CONDITIONS = {
  'Sıfır': 'Sıfır',
  'Sıfır Gibi': 'Sıfır Gibi',
  'Az Kullanılmış': 'Az Kullanılmış',
  'Kullanılmış': 'Kullanılmış',
  'Yıpranmış': 'Yıpranmış'
} as const;

export const CONDITIONS = [
  'Sıfır',
  'Sıfır Gibi',
  'Az Kullanılmış',
  'Kullanılmış',
  'Yıpranmış'
] as const;

export const STATUS_LABELS: Record<ListingStatus, string> = {
  PENDING: 'Onay Bekliyor',
  ACTIVE: 'Aktif',
  REJECTED: 'Reddedildi',
  SOLD: 'Satıldı'
};

export const STATUS_COLORS: Record<ListingStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SOLD: 'bg-blue-100 text-blue-800'
};
