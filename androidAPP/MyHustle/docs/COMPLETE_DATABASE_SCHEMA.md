# 🏪 MyHustle - Complete Database Schema Implementation

## 📊 **Analysis Summary**
Based on the app screenshots and codebase analysis, your MyHustle app is a **multi-vendor marketplace platform** that supports:

### **Core Features Identified:**
- 🏪 **Multi-shop marketplace** (businesses can create shops)
- 📦 **Product catalog** with inventory management
- 🛎️ **Service booking** system with time slots
- 💬 **Real-time messaging** between customers and shop owners
- ⭐ **Reviews and ratings** system
- 👤 **User profiles** (customers and business owners)
- 📱 **Mobile-first design** with Android app

---

## 🗄️ **Firebase Firestore Collections Structure**

### **1. USERS Collection** 👥
```typescript
/users/{userId}
{
  id: string,                    // Firebase Auth UID
  email: string,                 // Primary login
  displayName: string,           // Public display name
  photoUrl: string,              // Profile picture URL
  phoneNumber: string,           // Contact number
  userType: "CUSTOMER" | "BUSINESS_OWNER" | "ADMIN",
  
  // Profile Information
  profile: {
    firstName: string,
    lastName: string,
    dateOfBirth: string,         // YYYY-MM-DD
    bio: string,                 // User bio/description
    address: {
      street: string,
      city: string,
      state: string,
      zipCode: string,
      country: string,
      coordinates: {
        latitude: number,
        longitude: number
      }
    }
  },
  
  // Preferences
  preferences: {
    notifications: boolean,
    emailUpdates: boolean,
    language: string,            // "en", "es", etc.
    currency: string,            // "USD", "EUR", etc.
    favoriteCategories: string[]
  },
  
  // Account Status
  isVerified: boolean,           // Email/phone verification
  isActive: boolean,             // Account status
  isPremium: boolean,            // Premium subscription
  
  // Analytics
  totalOrders: number,           // Customer order count
  totalSpent: number,            // Customer lifetime value
  joinedAt: timestamp,
  lastLoginAt: timestamp,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **2. SHOPS Collection** 🏪
```typescript
/shops/{shopId}
{
  id: string,                    // Auto-generated
  ownerId: string,               // Reference to Users
  
  // Basic Information
  name: string,                  // Shop name
  description: string,           // Shop description
  category: string,              // Primary category
  subCategories: string[],       // Additional categories
  tags: string[],                // Search tags
  
  // Media
  logoUrl: string,               // Shop logo
  bannerUrl: string,             // Cover image
  imageUrls: string[],           // Gallery images
  
  // Contact & Location
  email: string,
  phone: string,
  website: string,
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    coordinates: {
      latitude: number,
      longitude: number
    },
    deliveryRadius: number       // Delivery radius in km
  },
  
  // Social Media
  socialMedia: {
    facebook: string,
    instagram: string,
    twitter: string,
    tiktok: string,
    youtube: string
  },
  
  // Business Hours
  operatingHours: {
    monday: { open: string, close: string, closed: boolean },
    tuesday: { open: string, close: string, closed: boolean },
    wednesday: { open: string, close: string, closed: boolean },
    thursday: { open: string, close: string, closed: boolean },
    friday: { open: string, close: string, closed: boolean },
    saturday: { open: string, close: string, closed: boolean },
    sunday: { open: string, close: string, closed: boolean }
  },
  
  // Business Details
  businessType: "RETAIL" | "SERVICE" | "RESTAURANT" | "PROFESSIONAL" | "OTHER",
  priceRange: "$" | "$$" | "$$$" | "$$$$",
  specialties: string[],
  certifications: string[],
  establishedYear: number,
  
  // Delivery & Payment
  deliveryOptions: string[],     // ["pickup", "delivery", "shipping"]
  paymentMethods: string[],      // ["cash", "card", "paypal", "crypto"]
  
  // Ratings & Reviews
  rating: number,                // Average rating (0-5)
  totalReviews: number,          // Total review count
  
  // Status & Features
  isActive: boolean,             // Shop visibility
  isVerified: boolean,           // Business verification
  isPremium: boolean,            // Premium features
  isOpen: boolean,               // Currently open
  
  // Performance Metrics
  totalSales: number,            // Total completed sales
  totalProducts: number,         // Product count
  totalServices: number,         // Service count
  responseTime: string,          // "Within 1 hour"
  fulfillmentRate: number,       // Order fulfillment percentage
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  lastActiveAt: timestamp
}
```

### **3. PRODUCTS Collection** 📦
```typescript
/products/{productId}
{
  id: string,                    // Auto-generated
  shopId: string,                // Reference to Shops
  ownerId: string,               // Reference to Users (shop owner)
  
  // Basic Information
  name: string,                  // Product name
  description: string,           // Detailed description
  shortDescription: string,      // Brief summary
  sku: string,                   // Stock Keeping Unit
  
  // Media
  primaryImageUrl: string,       // Main product image
  imageUrls: string[],           // Additional images
  videoUrls: string[],           // Product videos
  
  // Pricing
  price: number,                 // Current price
  originalPrice: number,         // Original price (for discounts)
  currency: string,              // "USD", "EUR", etc.
  costPrice: number,             // Cost to business (private)
  
  // Categorization
  category: string,              // Primary category
  subCategory: string,           // Sub-category
  tags: string[],                // Search/filter tags
  brand: string,                 // Product brand
  
  // Inventory Management
  inStock: boolean,              // Availability
  stockQuantity: number,         // Available quantity
  lowStockThreshold: number,     // Alert threshold
  trackInventory: boolean,       // Whether to track stock
  allowBackorders: boolean,      // Allow orders when out of stock
  
  // Physical Properties
  weight: number,                // Weight in grams
  dimensions: {
    length: number,              // cm
    width: number,               // cm
    height: number,              // cm
    unit: string                 // "cm", "in"
  },
  
  // Shipping
  shippingRequired: boolean,     // Requires shipping
  shippingWeight: number,        // Shipping weight
  shippingClass: string,         // Shipping category
  
  // Product Variants
  hasVariants: boolean,          // Has color/size variants
  variants: [{
    id: string,
    name: string,                // "Red - Large"
    sku: string,
    price: number,
    stockQuantity: number,
    attributes: {
      color: string,
      size: string,
      material: string
    }
  }],
  
  // SEO & Marketing
  keywords: string[],            // Search keywords
  metaTitle: string,             // SEO title
  metaDescription: string,       // SEO description
  isFeatured: boolean,           // Featured product
  isOnSale: boolean,             // On sale status
  salePrice: number,             // Sale price
  saleStartDate: timestamp,      // Sale start
  saleEndDate: timestamp,        // Sale end
  
  // Ratings & Reviews
  rating: number,                // Average rating
  totalReviews: number,          // Review count
  totalSales: number,            // Units sold
  
  // Product Specifications
  specifications: {
    [key: string]: string        // "Material": "Cotton", "Color": "Blue"
  },
  
  // Status
  isActive: boolean,             // Product listing status
  isDigital: boolean,            // Digital product (no shipping)
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp
}
```

### **4. SERVICES Collection** 🛎️
```typescript
/services/{serviceId}
{
  id: string,                    // Auto-generated
  shopId: string,                // Reference to Shops
  ownerId: string,               // Reference to Users (shop owner)
  
  // Basic Information
  name: string,                  // Service name
  description: string,           // Service description
  shortDescription: string,      // Brief summary
  
  // Media
  primaryImageUrl: string,       // Main service image
  imageUrls: string[],           // Service gallery
  videoUrls: string[],           // Service videos
  
  // Pricing
  basePrice: number,             // Starting price
  priceType: "FIXED" | "HOURLY" | "CUSTOM",
  hourlyRate: number,            // If priceType is HOURLY
  currency: string,
  
  // Duration & Scheduling
  estimatedDuration: number,     // Duration in minutes
  durationType: "MINUTES" | "HOURS" | "DAYS",
  minDuration: number,           // Minimum booking duration
  maxDuration: number,           // Maximum booking duration
  
  // Categorization
  category: string,              // Service category
  subCategory: string,           // Sub-category
  tags: string[],                // Search tags
  
  // Booking Settings
  isBookable: boolean,           // Can customers book online
  requiresConsultation: boolean, // Needs consultation first
  instantBooking: boolean,       // Immediate confirmation
  advanceBookingDays: number,    // How far ahead to book
  cancellationPolicy: string,    // Cancellation rules
  
  // Service Location
  serviceLocation: "ON_SITE" | "CUSTOMER_LOCATION" | "BOTH",
  travelRadius: number,          // Travel radius in km
  travelFee: number,             // Additional travel fee
  
  // Availability
  availability: {
    daysAvailable: string[],     // ["Monday", "Tuesday", ...]
    timeSlots: {
      [day: string]: {           // "Monday": {...}
        startTime: string,       // "09:00"
        endTime: string,         // "17:00"
        breakTimes: [{
          start: string,         // "12:00"
          end: string           // "13:00"
        }],
        slotDuration: number     // Minutes per slot
      }
    },
    blackoutDates: string[],     // Unavailable dates
    holidaySchedule: {
      [date: string]: {          // "2024-12-25": {...}
        closed: boolean,
        hours: {
          start: string,
          end: string
        }
      }
    }
  },
  
  // Service Details
  requirements: string[],        // What customer needs to provide
  included: string[],            // What's included
  notIncluded: string[],         // What's NOT included
  preparation: string[],         // How to prepare
  
  // Staff Assignment
  assignedStaff: string[],       // Staff member IDs
  maxConcurrentBookings: number, // Max simultaneous bookings
  
  // Ratings & Reviews
  rating: number,                // Average rating
  totalReviews: number,          // Review count
  totalBookings: number,         // Completed bookings
  
  // Status
  isActive: boolean,             // Service availability
  isFeatured: boolean,           // Featured service
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **5. ORDERS Collection** 🛒
```typescript
/orders/{orderId}
{
  id: string,                    // Auto-generated
  orderNumber: string,           // Human-readable order number
  customerId: string,            // Reference to Users
  shopId: string,                // Reference to Shops
  ownerId: string,               // Shop owner ID
  
  // Order Items
  items: [{
    productId: string,           // Reference to Products
    name: string,                // Product name (snapshot)
    sku: string,                 // Product SKU
    price: number,               // Price at time of order
    quantity: number,            // Ordered quantity
    imageUrl: string,            // Product image (snapshot)
    variantId: string,           // If product has variants
    variantName: string,         // Variant details
    specifications: object       // Selected specifications
  }],
  
  // Pricing Breakdown
  subtotal: number,              // Items total
  tax: number,                   // Tax amount
  taxRate: number,               // Tax percentage
  shippingFee: number,           // Shipping cost
  deliveryFee: number,           // Delivery fee
  serviceFee: number,            // Platform fee
  discount: number,              // Discount applied
  discountCode: string,          // Coupon/promo code used
  total: number,                 // Final total
  currency: string,
  
  // Order Status
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED",
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIAL_REFUND",
  fulfillmentStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED",
  
  // Customer Information
  customerInfo: {
    name: string,
    email: string,
    phone: string
  },
  
  // Shipping Information
  shippingMethod: "PICKUP" | "DELIVERY" | "SHIPPING",
  shippingAddress: {
    recipientName: string,
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string,
    instructions: string         // Delivery instructions
  },
  
  // Tracking
  trackingNumber: string,        // Shipping tracking number
  carrier: string,               // Shipping carrier
  estimatedDelivery: timestamp,  // Expected delivery
  
  // Payment Information
  paymentMethod: string,         // "card", "cash", "paypal"
  paymentReference: string,      // Payment gateway reference
  
  // Order Notes
  customerNotes: string,         // Customer's order notes
  internalNotes: string,         // Shop's internal notes
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  confirmedAt: timestamp,
  shippedAt: timestamp,
  deliveredAt: timestamp,
  cancelledAt: timestamp
}
```

### **6. BOOKINGS Collection** 📅
```typescript
/bookings/{bookingId}
{
  id: string,                    // Auto-generated
  bookingNumber: string,         // Human-readable booking number
  customerId: string,            // Reference to Users
  shopId: string,                // Reference to Shops
  serviceId: string,             // Reference to Services
  ownerId: string,               // Shop owner ID
  
  // Booking Details
  serviceName: string,           // Service name (snapshot)
  servicePrice: number,          // Price at time of booking
  serviceDuration: number,       // Duration in minutes
  
  // Schedule Information
  requestedDate: string,         // Requested date (YYYY-MM-DD)
  requestedTime: string,         // Requested time (HH:MM)
  confirmedDate: string,         // Confirmed date
  confirmedTime: string,         // Confirmed time
  endTime: string,               // Calculated end time
  timeZone: string,              // "America/New_York"
  
  // Location Details
  serviceLocation: "ON_SITE" | "CUSTOMER_LOCATION",
  serviceAddress: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    instructions: string,        // Special location instructions
    contactPerson: string,       // On-site contact
    contactPhone: string
  },
  
  // Booking Status
  status: "PENDING" | "ACCEPTED" | "DENIED" | "MODIFIED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
  
  // Pricing
  basePrice: number,
  additionalServices: [{
    name: string,
    price: number
  }],
  travelFee: number,             // If applicable
  discount: number,              // Applied discount
  total: number,
  currency: string,
  
  // Payment
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED",
  paymentMethod: string,
  depositRequired: number,       // Deposit amount
  depositPaid: number,           // Deposit paid
  
  // Customer Information
  customerInfo: {
    name: string,
    email: string,
    phone: string,
    specialRequests: string      // Customer's special requests
  },
  
  // Communication
  customerNotes: string,         // Customer's booking notes
  ownerNotes: string,            // Owner's private notes
  publicNotes: string,           // Visible to customer
  
  // Staff Assignment
  assignedStaff: string[],       // Staff member IDs
  
  // Reminders & Notifications
  remindersSent: [{
    type: "EMAIL" | "SMS" | "PUSH",
    sentAt: timestamp,
    reminderTime: string         // "24_hours", "1_hour"
  }],
  
  // Follow-up
  followUpSent: boolean,         // Post-service follow-up
  reviewRequested: boolean,      // Review request sent
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  acceptedAt: timestamp,
  completedAt: timestamp,
  cancelledAt: timestamp
}
```

### **7. CONVERSATIONS Collection** 💬
```typescript
/conversations/{conversationId}
{
  id: string,                    // Auto-generated
  participants: string[],        // Array of user IDs
  participantInfo: {
    [userId: string]: {
      name: string,
      photoUrl: string,
      lastSeen: timestamp
    }
  },
  
  // Context
  contextType: "GENERAL" | "ORDER" | "BOOKING" | "SUPPORT" | "SHOP_INQUIRY",
  contextId: string,             // Related order/booking ID
  shopId: string,                // If shop-related
  
  // Last Message Info
  lastMessage: {
    content: string,
    senderId: string,
    messageType: string,
    timestamp: timestamp
  },
  
  // Unread Tracking
  unreadCount: {
    [userId: string]: number
  },
  lastReadBy: {
    [userId: string]: timestamp
  },
  
  // Conversation Settings
  isActive: boolean,
  isMuted: {
    [userId: string]: boolean
  },
  isArchived: {
    [userId: string]: boolean
  },
  
  // Priority & Tags
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT",
  tags: string[],                // For organization
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **8. MESSAGES Collection** 📨
```typescript
/messages/{messageId}
{
  id: string,                    // Auto-generated
  conversationId: string,        // Reference to Conversations
  senderId: string,              // Reference to Users
  receiverId: string,            // Reference to Users
  
  // Message Content
  content: string,               // Message text
  messageType: "TEXT" | "IMAGE" | "FILE" | "VOICE" | "LOCATION" | "BOOKING_REQUEST" | "BOOKING_UPDATE" | "ORDER_UPDATE" | "SYSTEM",
  
  // Rich Content
  attachments: [{
    type: "IMAGE" | "DOCUMENT" | "VIDEO" | "AUDIO",
    url: string,
    filename: string,
    size: number,                // File size in bytes
    mimeType: string
  }],
  
  // Context Data (for system messages)
  contextData: {
    bookingId: string,           // If booking-related
    orderId: string,             // If order-related
    productId: string,           // If product-related
    serviceId: string,           // If service-related
    actionType: string,          // "booking_created", "order_shipped", etc.
    previousValue: string,       // For status changes
    newValue: string
  },
  
  // Message Status
  isRead: boolean,
  readAt: timestamp,
  isDelivered: boolean,
  deliveredAt: timestamp,
  isEdited: boolean,
  editedAt: timestamp,
  isDeleted: boolean,
  deletedAt: timestamp,
  
  // Reactions & Engagement
  reactions: {
    [emoji: string]: string[]    // "👍": ["userId1", "userId2"]
  },
  
  // Reply Threading
  replyToMessageId: string,      // If replying to a message
  threadId: string,              // Thread identifier
  
  // Timestamps
  timestamp: timestamp,
  createdAt: timestamp
}
```

### **9. REVIEWS Collection** ⭐
```typescript
/reviews/{reviewId}
{
  id: string,                    // Auto-generated
  customerId: string,            // Reference to Users
  shopId: string,                // Reference to Shops
  
  // Review Target
  targetType: "SHOP" | "PRODUCT" | "SERVICE",
  targetId: string,              // ID of reviewed item
  targetName: string,            // Name for display
  
  // Review Content
  rating: number,                // Rating (1-5)
  title: string,                 // Review title
  content: string,               // Review text
  
  // Detailed Ratings (for services)
  detailedRatings: {
    quality: number,             // Service/product quality
    communication: number,       // Communication rating
    timeliness: number,          // On-time performance
    value: number,               // Value for money
    professionalism: number      // Professional behavior
  },
  
  // Media
  imageUrls: string[],           // Review photos
  videoUrls: string[],           // Review videos
  
  // Context
  orderId: string,               // Related order (if any)
  bookingId: string,             // Related booking (if any)
  verifiedPurchase: boolean,     // Customer actually bought/booked
  
  // Owner Response
  ownerResponse: {
    content: string,
    respondedAt: timestamp,
    ownerId: string
  },
  
  // Helpfulness
  helpfulVotes: number,          // How many found it helpful
  unhelpfulVotes: number,        // How many found it unhelpful
  votedBy: string[],             // User IDs who voted
  
  // Moderation
  isVisible: boolean,            // Review visibility
  isFlagged: boolean,            // Reported for inappropriate content
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED",
  moderationNotes: string,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **10. FAVORITES Collection** ❤️
```typescript
/favorites/{favoriteId}
{
  id: string,                    // Auto-generated
  userId: string,                // Reference to Users
  
  // Favorite Target
  targetType: "SHOP" | "PRODUCT" | "SERVICE",
  targetId: string,              // ID of favorited item
  targetName: string,            // Name for display
  targetImageUrl: string,        // Image for display
  
  // Context
  shopId: string,                // Parent shop ID
  shopName: string,              // Shop name for display
  
  // Metadata
  notes: string,                 // User's private notes
  tags: string[],                // User's organization tags
  
  // Timestamps
  createdAt: timestamp
}
```

### **11. NOTIFICATIONS Collection** 🔔
```typescript
/notifications/{notificationId}
{
  id: string,                    // Auto-generated
  userId: string,                // Reference to Users
  
  // Notification Content
  type: "ORDER_UPDATE" | "BOOKING_UPDATE" | "NEW_MESSAGE" | "REVIEW_RECEIVED" | "PAYMENT_RECEIVED" | "SHOP_UPDATE" | "SYSTEM" | "PROMOTIONAL",
  title: string,                 // Notification title
  message: string,               // Notification content
  
  // Rich Content
  imageUrl: string,              // Notification image
  iconType: string,              // Icon to display
  
  // Context
  relatedId: string,             // Related entity ID
  relatedType: string,           // "order", "booking", "message"
  
  // Action
  actionUrl: string,             // Deep link to relevant screen
  actionLabel: string,           // "View Order", "Reply"
  
  // Targeting
  audience: "CUSTOMER" | "BUSINESS_OWNER" | "ALL",
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT",
  
  // Delivery
  channels: string[],            // ["push", "email", "sms"]
  sentChannels: string[],        // Channels actually sent to
  deliveryStatus: {
    push: "SENT" | "DELIVERED" | "FAILED",
    email: "SENT" | "DELIVERED" | "OPENED" | "FAILED",
    sms: "SENT" | "DELIVERED" | "FAILED"
  },
  
  // Status
  isRead: boolean,
  readAt: timestamp,
  isActionTaken: boolean,        // User took the suggested action
  actionTakenAt: timestamp,
  
  // Timestamps
  createdAt: timestamp,
  expiresAt: timestamp           // When notification becomes irrelevant
}
```

### **12. ANALYTICS Collection** 📊
```typescript
/analytics/{analyticsId}
{
  id: string,                    // Auto-generated
  
  // Scope
  scope: "SHOP" | "PRODUCT" | "SERVICE" | "USER" | "PLATFORM",
  entityId: string,              // ID of tracked entity
  
  // Time Period
  period: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
  date: string,                  // YYYY-MM-DD
  
  // Metrics
  views: number,                 // Page/item views
  clicks: number,                // Click-through
  conversions: number,           // Sales/bookings
  revenue: number,               // Revenue generated
  
  // Engagement
  favorites: number,             // Times favorited
  shares: number,                // Times shared
  messages: number,              // Messages initiated
  
  // Performance
  averageRating: number,         // Average rating received
  responseTime: number,          // Response time in minutes
  fulfillmentRate: number,       // Order fulfillment rate
  
  // Geographic Data
  topCities: string[],           // Top performing cities
  topCountries: string[],        // Top performing countries
  
  // Timestamps
  createdAt: timestamp,
  lastUpdated: timestamp
}
```

---

## 🔐 **Enhanced Security Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isShopOwner(resource) {
      return isAuthenticated() && request.auth.uid == resource.data.ownerId;
    }
    
    function isCustomerOrOwner(resource) {
      return isAuthenticated() && 
        (request.auth.uid == resource.data.customerId || 
         request.auth.uid == resource.data.ownerId);
    }
    
    function isParticipant(resource) {
      return isAuthenticated() && 
        request.auth.uid in resource.data.participants;
    }
    
    // Users - can read/write own data
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
    
    // Shops - public read for active, owners can write
    match /shops/{shopId} {
      allow read: if resource.data.isActive == true;
      allow write: if isShopOwner(resource) || 
        (request.resource != null && isShopOwner(request.resource));
    }
    
    // Products - public read for active, shop owners can write
    match /products/{productId} {
      allow read: if resource.data.isActive == true;
      allow write: if isShopOwner(resource);
    }
    
    // Services - public read for active, shop owners can write
    match /services/{serviceId} {
      allow read: if resource.data.isActive == true;
      allow write: if isShopOwner(resource);
    }
    
    // Orders - customers and shop owners can access
    match /orders/{orderId} {
      allow read, write: if isCustomerOrOwner(resource);
    }
    
    // Bookings - customers and shop owners can access
    match /bookings/{bookingId} {
      allow read, write: if isCustomerOrOwner(resource);
    }
    
    // Conversations - participants only
    match /conversations/{conversationId} {
      allow read, write: if isParticipant(resource);
    }
    
    // Messages - sender and receiver only
    match /messages/{messageId} {
      allow read, write: if isAuthenticated() && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
    }
    
    // Reviews - public read for visible, customers can write own
    match /reviews/{reviewId} {
      allow read: if resource.data.isVisible == true;
      allow write: if isAuthenticated() && 
        request.auth.uid == resource.data.customerId;
      // Shop owners can respond
      allow update: if isShopOwner(resource) && 
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['ownerResponse']);
    }
    
    // Favorites - users can manage own
    match /favorites/{favoriteId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Notifications - users can read own
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && 
        request.auth.uid == resource.data.userId;
    }
    
    // Analytics - shop owners can read own, platform read-only
    match /analytics/{analyticsId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.entityId || 
         resource.data.scope == "PLATFORM");
      allow write: if false; // Only server can write
    }
  }
}
```

---

## 🔗 **Composite Indexes for Performance**

```javascript
// Essential indexes for your app

// Shop queries
shops: [isActive, category, rating, createdAt]
shops: [ownerId, isActive, updatedAt]
shops: [category, isActive, isPremium, rating]

// Product queries
products: [shopId, isActive, category, isFeatured]
products: [ownerId, isActive, createdAt]
products: [category, isActive, rating, price]
products: [isActive, isFeatured, rating]

// Service queries
services: [shopId, isActive, category, isBookable]
services: [ownerId, isActive, createdAt]
services: [category, isActive, rating, basePrice]

// Order management
orders: [customerId, status, createdAt]
orders: [shopId, status, createdAt]
orders: [ownerId, status, updatedAt]

// Booking management
bookings: [customerId, status, requestedDate]
bookings: [shopId, status, requestedDate]
bookings: [ownerId, status, confirmedDate]

// Messaging
messages: [conversationId, timestamp]
conversations: [participants, updatedAt]

// Reviews
reviews: [shopId, targetType, isVisible, createdAt]
reviews: [targetId, targetType, isVisible, rating]

// Analytics
analytics: [entityId, scope, period, date]
analytics: [scope, date, createdAt]
```

---

## 🚀 **Implementation Steps**

### **Phase 1: Database Setup**
1. **Configure Firebase Collections** - Set up all collections with proper indexes
2. **Deploy Security Rules** - Apply comprehensive security rules
3. **Initialize Sample Data** - Use your existing sample data uploaders

### **Phase 2: Model Updates**
1. **Enhance Data Models** - Update your existing models to match schema
2. **Create Missing Models** - Add Order, Review, Favorite, Notification models
3. **Update Repositories** - Extend repositories for new collections

### **Phase 3: Feature Implementation**
1. **Order Management** - Implement shopping cart and order processing
2. **Enhanced Messaging** - Add file attachments and system messages
3. **Review System** - Build rating and review functionality
4. **Analytics Dashboard** - Create business analytics for shop owners

### **Phase 4: Testing & Optimization**
1. **Security Testing** - Verify all security rules work correctly
2. **Performance Testing** - Ensure queries are optimized
3. **User Experience Testing** - Test complete user flows

---

## 📊 **Expected Collections After Implementation**

- **users** (User profiles and authentication)
- **shops** (Business listings and information)
- **products** (Product catalog with inventory)
- **services** (Bookable services with scheduling)
- **orders** (E-commerce transactions)
- **bookings** (Service appointments)
- **conversations** (Message threads)
- **messages** (Individual messages)
- **reviews** (Ratings and feedback)
- **favorites** (User favorites/wishlist)
- **notifications** (Push notifications and alerts)
- **analytics** (Performance metrics)

This comprehensive schema will support your full marketplace functionality with real-time messaging, e-commerce, service booking, and analytics!
