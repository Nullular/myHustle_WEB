// Sample order data for testing Order Management system
// This data matches the Android app structure exactly

import { Order, OrderStatus, OrderItem, CustomerInfo, ShippingAddress, ShippingMethod, PaymentStatus, FulfillmentStatus } from '@/types/order';

// Sample order items
const sampleOrderItems: OrderItem[] = [
  {
    productId: 'prod-001',
    name: 'Premium Coffee Beans',
    sku: 'COFFEE-001',
    price: 24.99,
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200',
    variantId: 'var-001',
    variantName: 'Medium Roast - 500g',
    specifications: {
      'Roast Level': 'Medium',
      'Weight': '500g',
      'Origin': 'Colombia'
    }
  },
  {
    productId: 'prod-002',
    name: 'Artisan Mug',
    sku: 'MUG-001',
    price: 15.99,
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=200',
    variantId: 'var-002',
    variantName: 'Ceramic - Blue',
    specifications: {
      'Material': 'Ceramic',
      'Color': 'Blue',
      'Capacity': '350ml'
    }
  }
];

// Sample customer info
const sampleCustomers: CustomerInfo[] = [
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 987-6543'
  },
  {
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '+1 (555) 456-7890'
  }
];

// Sample shipping addresses
const sampleAddresses: ShippingAddress[] = [
  {
    recipientName: 'John Smith',
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    phone: '+1 (555) 123-4567',
    instructions: 'Leave at front door'
  },
  {
    recipientName: 'Sarah Johnson',
    street: '456 Oak Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
    phone: '+1 (555) 987-6543',
    instructions: 'Ring doorbell'
  }
];

// Function to generate sample orders
export const generateSampleOrders = (shopId: string, ownerId: string, count: number = 10): Order[] => {
  const orders: Order[] = [];
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const orderNumber = `ORD-${String(Date.now() + i).slice(-8)}`;
    const customerId = `customer-${i + 1}`;
    const customerInfo = sampleCustomers[i % sampleCustomers.length];
    const shippingAddress = sampleAddresses[i % sampleAddresses.length];
    
    // Random order items (1-3 items per order)
    const numItems = Math.floor(Math.random() * 3) + 1;
    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    
    for (let j = 0; j < numItems; j++) {
      const item = { ...sampleOrderItems[j % sampleOrderItems.length] };
      item.quantity = Math.floor(Math.random() * 3) + 1;
      orderItems.push(item);
      subtotal += item.price * item.quantity;
    }
    
    // Calculate pricing
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const deliveryFee = Math.random() > 0.5 ? 5.99 : 0;
    const total = subtotal + tax + deliveryFee;
    
    // Random status distribution
    const statuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED
    ];
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Create timestamps based on status
    const createdAt = now - (Math.random() * 30 * 24 * 60 * 60 * 1000); // Within last 30 days
    let confirmedAt = 0;
    let shippedAt = 0;
    let deliveredAt = 0;
    let cancelledAt = 0;
    
    if (status !== OrderStatus.PENDING && status !== OrderStatus.CANCELLED) {
      confirmedAt = createdAt + (Math.random() * 60 * 60 * 1000); // 1 hour after creation
    }
    
    if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
      shippedAt = confirmedAt + (Math.random() * 24 * 60 * 60 * 1000); // 1 day after confirmation
    }
    
    if (status === OrderStatus.DELIVERED) {
      deliveredAt = shippedAt + (Math.random() * 72 * 60 * 60 * 1000); // 3 days after shipping
    }
    
    if (status === OrderStatus.CANCELLED) {
      cancelledAt = createdAt + (Math.random() * 24 * 60 * 60 * 1000); // Within 1 day
    }
    
    const order: Order = {
      id: `order-${i + 1}`,
      orderNumber,
      customerId,
      shopId,
      ownerId,
      
      // Order Items
      items: orderItems,
      
      // Pricing
      subtotal,
      tax,
      taxRate,
      shippingFee: 0,
      deliveryFee,
      serviceFee: 0,
      discount: 0,
      discountCode: '',
      total,
      currency: 'USD',
      
      // Status
      status,
      paymentStatus: status === OrderStatus.CANCELLED ? PaymentStatus.FAILED : PaymentStatus.PAID,
      fulfillmentStatus: status === OrderStatus.DELIVERED ? FulfillmentStatus.DELIVERED : FulfillmentStatus.PENDING,
      
      // Customer Info
      customerInfo,
      
      // Shipping
      shippingMethod: Math.random() > 0.5 ? ShippingMethod.DELIVERY : ShippingMethod.PICKUP,
      shippingAddress,
      trackingNumber: status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED ? `TRK${String(Math.random()).slice(2, 12)}` : '',
      carrier: status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED ? 'FedEx' : '',
      estimatedDelivery: status === OrderStatus.SHIPPED ? Date.now() + (2 * 24 * 60 * 60 * 1000) : 0,
      
      // Payment
      paymentMethod: 'Credit Card',
      paymentReference: `PAY-${String(Math.random()).slice(2, 12)}`,
      
      // Notes
      customerNotes: i % 3 === 0 ? 'Please handle with care' : '',
      internalNotes: i % 4 === 0 ? 'Priority customer' : '',
      
      // Timestamps
      createdAt,
      updatedAt: Math.max(createdAt, confirmedAt, shippedAt, deliveredAt, cancelledAt),
      confirmedAt,
      shippedAt,
      deliveredAt,
      cancelledAt
    };
    
    orders.push(order);
  }
  
  return orders.sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date, newest first
};

// Sample order data for quick testing
export const sampleOrders: Order[] = generateSampleOrders('sample-shop-1', 'sample-owner-1', 15);
