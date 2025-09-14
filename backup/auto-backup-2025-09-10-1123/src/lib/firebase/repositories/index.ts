// Central export for all Firebase repositories
// This matches the Android repository pattern structure

export { shopRepository } from './shopRepository';
export { productRepository } from './productRepository';
export { serviceRepository } from './serviceRepository';
export { favoriteRepository } from './favoriteRepository';

// Re-export types for convenience
export type {
  Shop,
  Product,
  Service,
  User,
  Order,
  Booking,
  Favorite,
  CatalogItem,
  Chat,
  ChatMessage
} from '@/types/models';
