/**
 * Standardized categories/genres for MyHustle platform
 * This file ensures consistency across all screens (main, create store, edit store, products, etc.)
 */

export const SHOP_CATEGORIES = [
  'All', // For filtering only
  'Featured', // For filtering only
  'Popular', // For filtering only
  'Open Now', // For filtering only
  'Fashion & Accessories',
  'Jewelry',
  'Beauty & Cosmetics',
  'Health & Wellness',
  'Food & Catering',
  'Home & Décor',
  'Arts & Crafts',
  'Children & Education',
  'Technology & Gadgets',
  'Entertainment',
  'Pets & Animals',
  'Gifts & Parties',
  'Perfume',
  'Financial & Services',
  'Vehicles & Automotive'
] as const;

export const PRODUCT_CATEGORIES = [
  'Fashion & Accessories',
  'Jewelry',
  'Beauty & Cosmetics',
  'Health & Wellness',
  'Food & Catering',
  'Home & Décor',
  'Arts & Crafts',
  'Children & Education',
  'Technology & Gadgets',
  'Entertainment',
  'Pets & Animals',
  'Gifts & Parties',
  'Perfume',
  'Financial & Services',
  'Vehicles & Automotive'
] as const;

// Filter categories include special filters + business categories
export const FILTER_CATEGORIES = [
  'All',
  'Featured',
  'Popular',
  'Open Now',
  ...PRODUCT_CATEGORIES
] as const;

// Business categories (for create/edit store) - no special filters
export const BUSINESS_CATEGORIES = [
  'Fashion & Accessories',
  'Jewelry',
  'Beauty & Cosmetics',
  'Health & Wellness',
  'Food & Catering',
  'Home & Décor',
  'Arts & Crafts',
  'Children & Education',
  'Technology & Gadgets',
  'Entertainment',
  'Pets & Animals',
  'Gifts & Parties',
  'Perfume',
  'Financial & Services',
  'Vehicles & Automotive'
] as const;

export const SERVICE_CATEGORIES = [
  'Consultation',
  'Repair',
  'Installation', 
  'Maintenance',
  'Cleaning',
  'Beauty & Wellness',
  'Fitness',
  'Education',
  'Legal',
  'Financial',
  'Marketing',
  'Design',
  'Photography',
  'Event Planning',
  'Transportation',
  'Healthcare',
  'Other'
] as const;

export type ShopCategory = typeof SHOP_CATEGORIES[number];
export type ProductCategory = typeof PRODUCT_CATEGORIES[number];
export type FilterCategory = typeof FILTER_CATEGORIES[number];
export type BusinessCategory = typeof BUSINESS_CATEGORIES[number];
export type ServiceCategory = typeof SERVICE_CATEGORIES[number];