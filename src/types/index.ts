// Core user types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  userType: 'customer' | 'business_owner' | 'admin';
  isVerified: boolean;
}

// Business/Store types
export interface Store {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  category: string;
  subCategory?: string;
  address: Address;
  contactInfo: ContactInfo;
  businessHours: BusinessHours[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  isVerified: boolean;
  features: StoreFeature[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface BusinessHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // "09:00"
  closeTime: string; // "17:00"
  isClosed: boolean;
}

export interface StoreFeature {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// Product types
export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  discountPrice?: number;
  images: string[];
  inventory: ProductInventory;
  specifications: ProductSpecification[];
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInventory {
  quantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  sku?: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

// Service types
export interface Service {
  id: string;
  storeId: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  duration: number; // in minutes
  images: string[];
  availability: ServiceAvailability;
  isActive: boolean;
  tags: string[];
  requirements?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceAvailability {
  isAvailable: boolean;
  maxBookingsPerSlot: number;
  advanceBookingDays: number;
  cancellationPolicy?: string;
}

// Booking types
export interface Booking {
  id: string;
  customerId: string;
  storeId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: Date;
  scheduledTime: string;
  duration: number;
  totalAmount: number;
  notes?: string;
  customerInfo: BookingCustomerInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface BookingCustomerInfo {
  name: string;
  phone: string;
  email: string;
  specialRequests?: string;
}

// Order types
export interface Order {
  id: string;
  customerId: string;
  storeId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  deliveryInfo: DeliveryInfo;
  paymentInfo: PaymentInfo;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  specifications?: ProductSpecification[];
  notes?: string;
}

export interface DeliveryInfo {
  type: 'pickup' | 'delivery';
  address?: Address;
  scheduledDate?: Date;
  scheduledTime?: string;
  deliveryFee?: number;
}

export interface PaymentInfo {
  method: 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  amount: number;
}

// Cart types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  storeId: string;
  storeName: string;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Message types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'customer' | 'business';
  content: string;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  customerId: string;
  storeId: string;
  customerName: string;
  storeName: string;
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics types
export interface BusinessAnalytics {
  storeId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  revenue: number;
  orders: number;
  bookings: number;
  newCustomers: number;
  topProducts: ProductPerformance[];
  topServices: ServicePerformance[];
  customerSatisfaction: number;
  generatedAt: Date;
}

export interface ProductPerformance {
  productId: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface ServicePerformance {
  serviceId: string;
  name: string;
  bookings: number;
  revenue: number;
}

// Form types for authentication
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  userType: 'customer' | 'business_owner';
  agreeToTerms: boolean;
}

// Filter and search types
export interface StoreFilter {
  category?: string;
  subCategory?: string;
  location?: string;
  rating?: number;
  isOpen?: boolean;
  features?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface SearchQuery {
  query: string;
  filters: StoreFilter;
  sortBy: 'relevance' | 'rating' | 'distance' | 'newest';
  page: number;
  limit: number;
}
