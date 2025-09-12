// Utility to seed Firebase with sample order data for testing
// This should only be used in development

import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { generateSampleOrders } from './sampleOrders';

export const seedSampleOrders = async (shopId: string, ownerId: string, count: number = 10) => {
  try {
    console.log('🌱 Starting to seed sample orders...');
    
    const orders = generateSampleOrders(shopId, ownerId, count);
    const ordersCollection = collection(db, 'orders');
    
    // Use batch writes for better performance
    const batch = writeBatch(db);
    
    orders.forEach((order) => {
      const orderRef = doc(ordersCollection);
      batch.set(orderRef, {
        ...order,
        id: orderRef.id, // Use Firestore generated ID
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        confirmedAt: order.confirmedAt > 0 ? new Date(order.confirmedAt) : null,
        shippedAt: order.shippedAt > 0 ? new Date(order.shippedAt) : null,
        deliveredAt: order.deliveredAt > 0 ? new Date(order.deliveredAt) : null,
        cancelledAt: order.cancelledAt > 0 ? new Date(order.cancelledAt) : null,
        estimatedDelivery: order.estimatedDelivery > 0 ? new Date(order.estimatedDelivery) : null,
      });
    });
    
    await batch.commit();
    
    console.log(`✅ Successfully seeded ${orders.length} sample orders`);
    return orders.length;
  } catch (error) {
    console.error('❌ Error seeding sample orders:', error);
    throw error;
  }
};

// Function to clear all orders (use with caution!)
export const clearAllOrders = async () => {
  try {
    console.log('🗑️  Clearing all orders...');
    
    // This is a simple implementation - in production, you'd want pagination
    // for large collections
    const ordersCollection = collection(db, 'orders');
    const batch = writeBatch(db);
    
    // Note: This is a simplified approach. For large collections,
    // you'd need to implement proper pagination and multiple batches
    
    console.log('⚠️  Clear all orders function needs to be implemented with proper pagination for safety');
    
  } catch (error) {
    console.error('❌ Error clearing orders:', error);
    throw error;
  }
};
