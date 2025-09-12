// Order management types matching Android app structure

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
  PREPARING = 'PREPARING',
  READY = 'READY',
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
  PARTIAL_REFUND = 'PARTIAL_REFUND'
}

export enum FulfillmentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED'
}

export enum ShippingMethod {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
  SHIPPING = 'SHIPPING'
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

export interface OrderOverview {
  pendingOrders: number;
  todaysOrders: number;
  shippedOrders: number;
  totalOrders: number;
}

// Helper function to get order status color and text
export const getOrderStatusInfo = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return { color: '#FF9800', text: 'Pending' };
    case OrderStatus.CONFIRMED:
      return { color: '#4CAF50', text: 'Confirmed' };
    case OrderStatus.PREPARING:
      return { color: '#9C27B0', text: 'Preparing' };
    case OrderStatus.READY:
      return { color: '#4CAF50', text: 'Ready' };
    case OrderStatus.SHIPPED:
      return { color: '#2196F3', text: 'Shipped' };
    case OrderStatus.DELIVERED:
      return { color: '#4CAF50', text: 'Delivered' };
    case OrderStatus.CANCELLED:
      return { color: '#F44336', text: 'Cancelled' };
    case OrderStatus.REFUNDED:
      return { color: '#F44336', text: 'Refunded' };
    default:
      return { color: '#9E9E9E', text: 'Unknown' };
  }
};
