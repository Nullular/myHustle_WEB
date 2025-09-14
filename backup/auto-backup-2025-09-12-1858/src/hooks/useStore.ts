// Re-export new repository-based hooks
export * from './useShops';
export * from './useProducts';
export * from './useFavorites';

// Legacy compatibility - redirect to new hooks
export { useShops as useStores } from './useShops';
export { useShop as useStore } from './useShops';
export { useShopProducts as useStoreCatalog } from './useProducts';
