// Core user types
export interface User {
  id: string;
  uid: string; // Firebase UID
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
  bannerUrl?: string;
  imageUrl?: string;
  category: string;
  subCategory?: string;
  location?: string;
  address: Address;
  phone?: string;
  email?: string;
  website?: string;
  contactInfo: ContactInfo;
  businessHours: BusinessHours[]; // Legacy field
  // Android operating hours fields
  openTime24: string; // "08:00" format
  closeTime24: string; // "18:00" format
  operatingHours?: Map<string, string>; // Additional hours data
  availability?: string;
  responseTime?: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  active?: boolean; // Firebase field name
  isVerified: boolean;
  isPremium?: boolean;
  priceRange?: string;
  features: StoreFeature[];
  tags?: string[];
  specialties?: string[];
  deliveryOptions?: string[];
  paymentMethods?: string[];
  socialMedia?: Map<string, string>;
  favoriteUserIds?: string[]; // Array of user IDs who favorited this store
  catalog?: any[]; // CatalogItem array
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
  shopId: string; // Changed from storeId to match Android
  ownerId: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  currency: string;
  primaryImageUrl?: string;
  images: string[]; // imageUrls in Android
  inventory: ProductInventory;
  specifications: ProductSpecification[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInventory {
  quantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  sku?: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

// Service types
export interface Service {
  id: string;
  shopId: string; // Changed from storeId to match Android
  ownerId: string;
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  price: number;
  currency: string;
  duration: number; // in minutes
  images: string[];
  availability: ServiceAvailability;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  requirements?: string[];
  rating: number;
  totalReviews: number;
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
