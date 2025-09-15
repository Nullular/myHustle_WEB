# MyHustle App - Comprehensive Database Schema
*Database Design for Production-Ready Marketplace App*

## 🎯 **Overview**
MyHustle is a comprehensive business marketplace platform enabling service providers and customers to connect, transact, and communicate. This schema supports both e-commerce (products) and service booking functionality with real-time messaging.

## 📊 **Database Architecture**

### **Technology Stack**
- **Primary**: Firebase Firestore (NoSQL Document Database)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage (media assets)
- **Real-time**: Firestore real-time listeners
- **Offline**: Firestore offline persistence

---

## 🏗️ **Core Collections Structure**

### 1. **Users Collection** (`users`)
```typescript
{
  id: string,                    // Firebase UID (auto-generated)
  email: string,                 // Primary identifier
  displayName: string?,          // Optional display name
  profileImageUrl: string?,      // Profile photo URL
  phoneNumber: string?,          // Contact number
  address: {                     // User address
    street: string?,
    city: string?,
    state: string?,
    zipCode: string?,
    country: string?
  },
  userType: "CUSTOMER" | "BUSINESS_OWNER" | "BOTH",
  createdAt: timestamp,
  updatedAt: timestamp,
  isVerified: boolean,           // Account verification status
  preferences: {                 // User preferences
    notifications: boolean,
    emailUpdates: boolean,
    favoriteCategories: string[]
  }
}
```

### 2. **Shops Collection** (`shops`)
```typescript
{
  id: string,                    // Auto-generated document ID
  ownerId: string,               // Reference to Users collection
  name: string,                  // Business name
  description: string,           // Business description
  logoUrl: string?,              // Business logo
  bannerUrl: string?,            // Cover/banner image
  rating: number,                // Average rating (0-5)
  totalReviews: number,          // Total review count
  
  // Business Details
  category: string,              // Main business category
  subCategories: string[],       // Additional categories
  tags: string[],                // Search tags
  
  // Contact Information
  email: string?,
  phone: string?,
  website: string?,
  socialMedia: {                 // Social media links
    facebook: string?,
    instagram: string?,
    twitter: string?,
    linkedin: string?
  },
  
  // Address
  address: {
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    latitude: number?,           // For location services
    longitude: number?
  },
  
  // Business Hours
  availability: {
    monday: { open: string?, close: string?, closed: boolean },
    tuesday: { open: string?, close: string?, closed: boolean },
    wednesday: { open: string?, close: string?, closed: boolean },
    thursday: { open: string?, close: string?, closed: boolean },
    friday: { open: string?, close: string?, closed: boolean },
    saturday: { open: string?, close: string?, closed: boolean },
    sunday: { open: string?, close: string?, closed: boolean }
  },
  
  // Business Status
  isActive: boolean,             // Business operational status
  isVerified: boolean,           // Verification badge
  isPremium: boolean,            // Premium membership
  
  // Metrics
  totalSales: number,            // Total completed transactions
  responseTime: string,          // Average response time
  establishedYear: number?,      // Year business was established
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. **Products Collection** (`products`)
```typescript
{
  id: string,                    // Auto-generated document ID
  shopId: string,                // Reference to Shops collection
  ownerId: string,               // Reference to Users collection
  
  // Product Details
  name: string,                  // Product name
  description: string,           // Detailed description
  shortDescription: string?,     // Brief summary
  
  // Pricing
  price: number,                 // Current price
  originalPrice: number?,        // Original price (for discounts)
  currency: string,              // Currency code (USD, EUR, etc.)
  
  // Media
  primaryImageUrl: string?,      // Main product image
  imageUrls: string[],           // Additional product images
  videoUrls: string[],           // Product videos
  
  // Categorization
  category: string,              // Primary category
  subCategory: string?,          // Sub-category
  tags: string[],                // Search/filter tags
  sku: string?,                  // Stock Keeping Unit
  
  // Inventory
  inStock: boolean,              // Availability status
  stockQuantity: number,         // Available quantity
  lowStockThreshold: number?,    // Alert threshold
  
  // Specifications
  specifications: {              // Product specifications
    [key: string]: string
  },
  
  // SEO & Discovery
  keywords: string[],            // Search keywords
  isFeatured: boolean,           // Featured product flag
  isDiscounted: boolean,         // Discount status
  discountPercentage: number?,   // Discount percentage
  
  // Ratings
  rating: number,                // Average rating
  totalReviews: number,          // Review count
  
  // Status
  isActive: boolean,             // Product listing status
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 4. **Services Collection** (`services`)
```typescript
{
  id: string,                    // Auto-generated document ID
  shopId: string,                // Reference to Shops collection
  ownerId: string,               // Reference to Users collection
  
  // Service Details
  name: string,                  // Service name
  description: string,           // Service description
  shortDescription: string?,     // Brief summary
  
  // Pricing
  basePrice: number,             // Starting price
  priceType: "FIXED" | "HOURLY" | "CUSTOM",
  currency: string,
  
  // Duration
  estimatedDuration: number,     // Duration in minutes
  durationType: "MINUTES" | "HOURS" | "DAYS",
  
  // Media
  primaryImageUrl: string?,      // Main service image
  imageUrls: string[],           // Service gallery
  videoUrls: string[],           // Service videos
  
  // Categorization
  category: string,              // Service category
  subCategory: string?,          // Sub-category
  tags: string[],                // Search tags
  
  // Availability
  isBookable: boolean,           // Can customers book online
  requiresConsultation: boolean, // Needs consultation first
  availableSlots: {              // Available time slots
    [date: string]: string[]     // date -> array of time slots
  },
  
  // Requirements
  requirements: string[],        // What customer needs to provide
  included: string[],            // What's included in service
  notIncluded: string[],         // What's not included
  
  // Location
  serviceLocation: "ON_SITE" | "CUSTOMER_LOCATION" | "BOTH",
  travelRadius: number?,         // Travel radius in km
  travelFee: number?,            // Additional travel fee
  
  // Ratings
  rating: number,                // Average rating
  totalReviews: number,          // Review count
  
  // Status
  isActive: boolean,             // Service listing status
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 5. **Orders Collection** (`orders`)
```typescript
{
  id: string,                    // Auto-generated document ID
  customerId: string,            // Reference to Users collection
  shopId: string,                // Reference to Shops collection
  ownerId: string,               // Shop owner reference
  
  // Order Details
  orderNumber: string,           // Human-readable order number
  items: [{                      // Array of ordered items
    productId: string,           // Reference to Products collection
    name: string,                // Product name (snapshot)
    price: number,               // Price at time of order
    quantity: number,            // Ordered quantity
    imageUrl: string?,           // Product image (snapshot)
    specifications: object?      // Selected specifications
  }],
  
  // Pricing
  subtotal: number,              // Items total
  tax: number,                   // Tax amount
  shippingFee: number,           // Shipping cost
  discount: number,              // Discount applied
  total: number,                 // Final total
  currency: string,
  
  // Status
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED",
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED",
  
  // Shipping
  shippingAddress: {
    recipientName: string,
    street: string,
    city: string,
    state: string,
    zipCode: string,
    country: string,
    phone: string?
  },
  
  // Tracking
  trackingNumber: string?,       // Shipping tracking number
  estimatedDelivery: timestamp?, // Expected delivery date
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  shippedAt: timestamp?,
  deliveredAt: timestamp?
}
```

### 6. **Bookings Collection** (`bookings`)
```typescript
{
  id: string,                    // Auto-generated document ID
  customerId: string,            // Reference to Users collection
  shopId: string,                // Reference to Shops collection
  serviceId: string,             // Reference to Services collection
  ownerId: string,               // Shop owner reference
  
  // Booking Details
  bookingNumber: string,         // Human-readable booking number
  serviceName: string,           // Service name (snapshot)
  servicePrice: number,          // Price at time of booking
  
  // Schedule
  requestedDate: string,         // Requested date (YYYY-MM-DD)
  requestedTime: string,         // Requested time (HH:MM)
  confirmedDate: string?,        // Confirmed date
  confirmedTime: string?,        // Confirmed time
  duration: number,              // Duration in minutes
  
  // Location
  serviceLocation: "ON_SITE" | "CUSTOMER_LOCATION",
  customerAddress: {             // If customer location
    street: string?,
    city: string?,
    state: string?,
    zipCode: string?,
    instructions: string?        // Special instructions
  }?,
  
  // Status & Communication
  status: "PENDING" | "ACCEPTED" | "DENIED" | "MODIFIED" | "COMPLETED" | "CANCELLED",
  customerNotes: string?,        // Customer's special requests
  ownerNotes: string?,           // Owner's notes
  
  // Pricing
  basePrice: number,
  additionalFees: number,        // Travel fees, etc.
  discount: number,              // Applied discount
  total: number,
  currency: string,
  
  // Payment
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED",
  paymentMethod: string?,
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp,
  completedAt: timestamp?
}
```

### 7. **Conversations Collection** (`conversations`)
```typescript
{
  id: string,                    // Auto-generated document ID
  participants: string[],        // Array of user IDs
  participantNames: {            // Map of userId -> displayName
    [userId: string]: string
  },
  
  // Last Message Info
  lastMessage: string,           // Last message content
  lastMessageTime: timestamp,    // Last message timestamp
  lastMessageSenderId: string,   // Who sent last message
  
  // Unread Counts
  unreadCount: {                 // Map of userId -> unread count
    [userId: string]: number
  },
  
  // Context
  bookingId: string?,            // Related booking (if any)
  orderId: string?,              // Related order (if any)
  type: "GENERAL" | "BOOKING" | "ORDER" | "SUPPORT",
  
  // Status
  isActive: boolean,             // Conversation status
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 8. **Messages Collection** (`messages`)
```typescript
{
  id: string,                    // Auto-generated document ID
  conversationId: string,        // Reference to Conversations collection
  senderId: string,              // Reference to Users collection
  senderName: string,            // Sender display name (snapshot)
  receiverId: string,            // Reference to Users collection
  receiverName: string,          // Receiver display name (snapshot)
  
  // Message Content
  content: string,               // Message text
  messageType: "TEXT" | "BOOKING_REQUEST" | "BOOKING_ACCEPTED" | "BOOKING_DENIED" | "BOOKING_MODIFIED" | "ORDER_UPDATE",
  
  // Attachments
  attachments: [{
    type: "IMAGE" | "DOCUMENT" | "VIDEO",
    url: string,
    filename: string?,
    size: number?
  }]?,
  
  // Context
  bookingId: string?,            // Related booking
  orderId: string?,              // Related order
  
  // Status
  isRead: boolean,               // Read status
  readAt: timestamp?,            // When message was read
  
  // Timestamps
  timestamp: timestamp,
  createdAt: timestamp
}
```

### 9. **Reviews Collection** (`reviews`)
```typescript
{
  id: string,                    // Auto-generated document ID
  customerId: string,            // Reference to Users collection
  shopId: string,                // Reference to Shops collection
  
  // Review Target
  targetType: "SHOP" | "PRODUCT" | "SERVICE",
  targetId: string,              // ID of reviewed item
  
  // Review Content
  rating: number,                // Rating (1-5)
  title: string?,                // Review title
  content: string,               // Review text
  
  // Context
  orderId: string?,              // Related order
  bookingId: string?,            // Related booking
  
  // Verification
  isVerifiedPurchase: boolean,   // Customer actually bought/booked
  
  // Responses
  ownerResponse: {               // Business owner response
    content: string,
    respondedAt: timestamp
  }?,
  
  // Status
  isVisible: boolean,            // Review visibility
  isFlagged: boolean,            // Reported for inappropriate content
  
  // Timestamps
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 10. **Favorites Collection** (`favorites`)
```typescript
{
  id: string,                    // Auto-generated document ID
  userId: string,                // Reference to Users collection
  
  // Favorite Target
  targetType: "SHOP" | "PRODUCT" | "SERVICE",
  targetId: string,              // ID of favorited item
  
  // Context
  shopId: string?,               // Shop reference (for products/services)
  
  // Timestamps
  createdAt: timestamp
}
```

### 11. **Notifications Collection** (`notifications`)
```typescript
{
  id: string,                    // Auto-generated document ID
  userId: string,                // Reference to Users collection
  
  // Notification Content
  type: "ORDER_UPDATE" | "BOOKING_UPDATE" | "NEW_MESSAGE" | "REVIEW_RECEIVED" | "PAYMENT_RECEIVED" | "SYSTEM",
  title: string,                 // Notification title
  message: string,               // Notification content
  
  // Context
  relatedId: string?,            // Related entity ID
  relatedType: string?,          // Related entity type
  
  // Actions
  actionUrl: string?,            // Deep link to relevant screen
  
  // Status
  isRead: boolean,               // Read status
  readAt: timestamp?,            // When notification was read
  
  // Timestamps
  createdAt: timestamp
}
```

---

## 🔗 **Relationships & Indexes**

### **Composite Indexes** (Firestore)
```javascript
// Shop listings with filtering
shops: [shopId, isActive, category, rating]
shops: [ownerId, isActive, createdAt]

// Product catalog
products: [shopId, isActive, category, isFeatured]
products: [ownerId, isActive, createdAt]

// Service listings
services: [shopId, isActive, category, isBookable]
services: [ownerId, isActive, createdAt]

// Order management
orders: [customerId, status, createdAt]
orders: [shopId, status, createdAt]

// Booking management
bookings: [customerId, status, requestedDate]
bookings: [shopId, status, requestedDate]

// Messaging
messages: [conversationId, timestamp]
conversations: [participants, updatedAt]

// Reviews
reviews: [shopId, targetType, isVisible, createdAt]
reviews: [customerId, createdAt]

// Favorites
favorites: [userId, targetType, createdAt]

// Notifications
notifications: [userId, isRead, createdAt]
```

---

## 🛡️ **Security Rules** (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Shops - owners can write, everyone can read active shops
    match /shops/{shopId} {
      allow read: if resource.data.isActive == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Products - shop owners can manage, everyone can read active products
    match /products/{productId} {
      allow read: if resource.data.isActive == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Services - shop owners can manage, everyone can read active services
    match /services/{serviceId} {
      allow read: if resource.data.isActive == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Orders - customers and shop owners can read their orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.customerId || 
         request.auth.uid == resource.data.ownerId);
    }
    
    // Bookings - customers and shop owners can read their bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.customerId || 
         request.auth.uid == resource.data.ownerId);
    }
    
    // Conversations - participants can read/write
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages - participants can read/write
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.receiverId);
    }
    
    // Reviews - anyone can read, customers can write their own
    match /reviews/{reviewId} {
      allow read: if resource.data.isVisible == true;
      allow write: if request.auth != null && request.auth.uid == resource.data.customerId;
    }
    
    // Favorites - users can manage their own favorites
    match /favorites/{favoriteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Notifications - users can read their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 📱 **Implementation Notes**

### **Data Consistency**
- Use Firestore transactions for critical operations (orders, payments)
- Implement optimistic UI updates with rollback capabilities
- Cache frequently accessed data locally

### **Performance Optimization**
- Paginate large collections (products, orders, messages)
- Use Firestore offline persistence
- Implement image lazy loading and compression
- Cache user preferences and shop data

### **Real-time Features**
- Real-time messaging with Firestore listeners
- Live order/booking status updates
- Instant notifications for business owners

### **Backup & Analytics**
- Export data to BigQuery for analytics
- Implement Firebase Cloud Functions for business logic
- Set up monitoring and alerting

This schema provides a solid foundation for your MyHustle marketplace app, supporting both e-commerce and service booking functionality with real-time communication capabilities.
