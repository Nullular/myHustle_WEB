// Central export for all Firebase repositories
// This matches the Android repository pattern structure

export { shopRepository } from './shopRepository';
export { productRepository } from './productRepository';
export { serviceRepository } from './serviceRepository';
export { favoriteRepository } from './favoriteRepository';
export { bookingRepository } from './bookingRepository';
export { orderRepository } from './orderRepository';

// Re-export types for convenience
export type {
  Shop,
  Product,
  Service,
  User,
  Order,
  Booking,
  BookingAnalytics,
  Favorite,
  CatalogItem,
  Chat,
  ChatMessage
} from '@/types/models';
