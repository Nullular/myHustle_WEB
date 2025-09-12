// Core data models matching Android implementation exactly
// These interfaces replicate the Android Kotlin data classes

export interface Shop {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  category: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  imageUrl: string;
  coverImageUrl: string;
  logoUrl: string;
  bannerUrl: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isPremium: boolean;
  active: boolean; // Note: using "active" not "isActive" to match Android database field
  availability: string;
  // 24h operating window for daily hours, format "HH:mm"
  openTime24: string;
  closeTime24: string;
  responseTime: string;
  operatingHours: Record<string, string>;
  socialMedia: Record<string, string>;
  tags: string[];
  specialties: string[];
  priceRange: string;
  deliveryOptions: string[];
  paymentMethods: string[];
  catalog: CatalogItem[];
  created_at: Date;
  updated_at: Date;
  isFavorite: boolean; // Client-side computed field
}

export interface Product {
  id: string;
  shopId: string;
  ownerId: string;
  name: string;
  description: string;
  primaryImageUrl: string;
  imageUrls: string[];
  price: number;
  currency: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
  unitsSold: number;
  expensePerUnit: number;
  rating: number;
  totalReviews: number;
  active: boolean; // Database field name (matches Firestore rules)
  isFeatured: boolean;
  tags: string[];
  specifications: Record<string, string>;
  weight: number;
  dimensions: ProductDimensions;
  variants: ProductVariant[];
  sizeVariants: SizeVariant[];
  createdAt: number;
  updatedAt: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  active: boolean; // Database field name
}

export interface SizeVariant {
  id: string;
  size: string;
  price: number;
  stockQuantity: number;
  active: boolean; // Database field name
}

export interface Service {
  id: string;
  shopId: string;
  ownerId: string;
  name: string;
  description: string;
  primaryImageUrl: string;
  imageUrls: string[];
  basePrice: number;
  currency: string;
  category: string;
  estimatedDuration: number; // minutes
  isBookable: boolean;
  allowsMultiDayBooking?: boolean; // Added for booking compatibility
  expensePerUnit: number;
  rating: number;
  totalReviews: number;
  active: boolean; // Database field name (matches Firestore rules)
  isFeatured: boolean;
  tags: string[];
  requirements: string[];
  includes: string[];
  availability: ServiceAvailability;
  createdAt: number;
  updatedAt: number;
}

export interface ServiceAvailability {
  daysAvailable: string[];
  startTime: string;
  endTime: string;
  timeSlotDuration: number; // minutes
  advanceBookingDays: number;
  cancellationPolicy: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string;
  userType: UserType;
  createdAt: number;
  verified: boolean; // Match database field name
  active: boolean; // Match database field name
  lastLoginAt: number;
  profile: UserProfile;
}

export enum UserType {
  CUSTOMER = 'CUSTOMER',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  ADMIN = 'ADMIN'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  address: Address;
  preferences: UserPreferences;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserPreferences {
  notifications: boolean;
  emailMarketing: boolean;
  language: string;
  currency: string;
  theme: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  shopId: string;
  ownerId: string;
  
  // Order Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  tax: number;
  taxRate: number;
  shippingFee: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  discountCode: string;
  total: number;
  currency: string;
  
  // Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Customer Info
  customerInfo: CustomerInfo;
  
  // Shipping
  shippingMethod: ShippingMethod;
  shippingAddress: ShippingAddress;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: number;
  
  // Payment
  paymentMethod: string;
  paymentReference: string;
  
  // Notes
  customerNotes: string;
  internalNotes: string;
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
  confirmedAt: number;
  shippedAt: number;
  deliveredAt: number;
  cancelledAt: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl: string;
  variantId: string;
  variantName: string;
  specifications: Record<string, string>;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  instructions: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export enum FulfillmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum ShippingMethod {
  PICKUP = 'PICKUP',
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  OVERNIGHT = 'OVERNIGHT'
}

export interface Booking {
  id: string;
  customerId: string;
  shopId: string;
  shopOwnerId: string;
  serviceId: string;
  serviceName: string;
  shopName: string;
  customerName: string;
  customerEmail: string;
  requestedDate: string;
  requestedTime: string;
  status: BookingStatus;
  notes: string;
  responseMessage: string;
  createdAt: number;
  updatedAt: number;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DENIED = 'DENIED',
  MODIFIED = 'MODIFIED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface BookingService {
  id: string;
  shopId: string;
  name: string;
  description: string;
  duration: number; // Duration in minutes
  price: number;
  active: boolean; // Database field name
  availableDays: string[];
  availableHours: string[];
}

export interface Favorite {
  id: string;
  userId: string;
  
  // Favorite Target
  targetType: FavoriteTargetType;
  targetId: string;
  targetName: string;
  targetImageUrl: string;
  
  // Context
  shopId: string;
  shopName: string;
  
  // Metadata
  notes: string;
  tags: string[];
  
  // Timestamps
  createdAt: number;
}

export enum FavoriteTargetType {
  SHOP = 'SHOP',
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE'
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'product' | 'service';
  price: number;
  category: string;
  active: boolean; // Database field name
}

// Chat and messaging models
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: Record<string, number>;
  shopId?: string;
  shopName?: string;
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
  userType: UserType;
  agreeToTerms: boolean;
}

// Cart interfaces
export interface CartItem {
  productId: string;
  serviceId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  shopId: string;
  storeName: string;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Booking interfaces
export interface Booking {
  id: string;
  customerId: string;
  shopId: string;
  shopOwnerId: string;
  serviceId: string;
  serviceName: string;
  shopName: string;
  customerName: string;
  customerEmail: string;
  requestedDate: string; // Format: "yyyy-MM-dd"
  requestedTime: string; // Format: "HH:mm"
  status: BookingStatus;
  notes: string;
  responseMessage: string;
  createdAt: number; // Timestamp in milliseconds
  updatedAt: number; // Timestamp in milliseconds
}

export interface BookingService {
  id: string;
  shopId: string;
  name: string;
  description: string;
  duration: number; // Duration in minutes
  price: number;
  isActive: boolean;
  availableDays: string[]; // e.g., ["Monday", "Tuesday"]
  availableHours: string[]; // e.g., ["9:00", "10:00"]
}

export interface BookingOverview {
  pendingRequests: number;
  todaysBookings: number;
  upcomingBookings: number;
  totalBookings: number;
}

export interface BookingAnalytics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  todayBookings: number;
}
