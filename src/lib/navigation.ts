// Navigation hierarchy and structured routing system
// This defines the logical back navigation paths for each route

export interface NavigationConfig {
  path: string;
  backPath: string | null;
  title?: string;
}

// Define the navigation hierarchy
const navigationHierarchy: NavigationConfig[] = [
  // Root level
  { path: '/', backPath: null, title: 'Main Screen' },
  
  // User authentication flows
  { path: '/login', backPath: '/', title: 'Login' },
  { path: '/register', backPath: '/', title: 'Register' },
  
  // User management flows
  { path: '/profile', backPath: '/', title: 'Profile' },
  { path: '/settings', backPath: '/profile', title: 'Settings' },
  { path: '/my-stores', backPath: '/', title: 'My Stores' },
  
  // Store creation and management
  { path: '/create-store', backPath: '/my-stores', title: 'Create Store' },
  
  // Store management hierarchy
  { path: '/store/[id]', backPath: '/', title: 'Store View' },
  { path: '/store/[id]/manage', backPath: '/my-stores', title: 'Store Management' },
  { path: '/store/[id]/catalog', backPath: '/store/[id]/manage', title: 'Catalog Management' },
  { path: '/store/[id]/inventory', backPath: '/store/[id]/manage', title: 'Inventory Management' },
  { path: '/store/[id]/booking-management', backPath: '/store/[id]/manage', title: 'Booking Management' },
  { path: '/store/[id]/booking-requests', backPath: '/store/[id]/booking-management', title: 'Booking Requests' },
  { path: '/store/[id]/all-bookings', backPath: '/store/[id]/booking-management', title: 'All Bookings' },
  { path: '/store/[id]/calendar', backPath: '/store/[id]/booking-management', title: 'Calendar View' },
  { path: '/store/[id]/calendar-view', backPath: '/store/[id]/booking-management', title: 'Calendar View' },
  
  // Product and service management
  { path: '/store/[id]/add-product', backPath: '/store/[id]/catalog', title: 'Add Product' },
  { path: '/store/[id]/add-service', backPath: '/store/[id]/catalog', title: 'Add Service' },
  { path: '/store/[id]/product/[productId]/edit', backPath: '/store/[id]/catalog', title: 'Edit Product' },
  { path: '/store/[id]/service/[serviceId]/edit', backPath: '/store/[id]/catalog', title: 'Edit Service' },
  
  // Shopping and booking flows
  { path: '/cart', backPath: '/', title: 'Cart' },
  { path: '/checkout', backPath: '/cart', title: 'Checkout' },
  { path: '/booking', backPath: '/', title: 'Booking' },
  { path: '/booking-demo', backPath: '/', title: 'Booking Demo' },
  
  // Product and service viewing
  { path: '/item/[id]', backPath: '/', title: 'Item Details' },
  { path: '/service/[id]', backPath: '/', title: 'Service Details' },
  
  // Communication flows
  { path: '/messages', backPath: '/', title: 'Messages' },
  { path: '/chat', backPath: '/messages', title: 'Chat' },
  { path: '/chat/[id]', backPath: '/messages', title: 'Chat' },
  
  // Other flows
  { path: '/about', backPath: '/', title: 'About' },
];

/**
 * Gets the logical back navigation path for a given route
 * @param currentPath - The current route path
 * @returns The back navigation path or null if at root
 */
export function getBackPath(currentPath: string): string | null {
  // Handle dynamic routes by replacing parameters with [id], [productId], etc.
  const normalizedPath = normalizePath(currentPath);
  
  const config = navigationHierarchy.find(nav => nav.path === normalizedPath);
  return config?.backPath || '/';
}

/**
 * Gets the page title for a given route
 * @param currentPath - The current route path
 * @returns The page title
 */
export function getPageTitle(currentPath: string): string {
  const normalizedPath = normalizePath(currentPath);
  const config = navigationHierarchy.find(nav => nav.path === normalizedPath);
  return config?.title || 'MyHustle';
}

/**
 * Normalizes a path by replacing dynamic segments with placeholders
 * @param path - The actual path with real IDs
 * @returns Normalized path with placeholders
 */
function normalizePath(path: string): string {
  // Remove query parameters
  const cleanPath = path.split('?')[0];
  
  // Replace UUIDs and other dynamic segments
  return cleanPath
    .replace(/\/[a-zA-Z0-9_-]{20,}/g, '/[id]')  // Replace long IDs with [id]
    .replace(/\/product\/[^/]+/g, '/product/[productId]')
    .replace(/\/service\/[^/]+/g, '/service/[serviceId]')
    .replace(/\/item\/[^/]+/g, '/item/[id]')
    .replace(/\/chat\/[^/]+/g, '/chat/[id]');
}

/**
 * Creates a breadcrumb trail for the current path
 * @param currentPath - The current route path
 * @returns Array of breadcrumb items
 */
export interface BreadcrumbItem {
  title: string;
  path: string;
  isActive: boolean;
}

export function getBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  let currentRoute: string | null = currentPath;
  
  // Build breadcrumbs by walking up the hierarchy
  while (currentRoute && currentRoute !== '/') {
    const backPath = getBackPath(currentRoute);
    const title = getPageTitle(currentRoute);
    
    breadcrumbs.unshift({
      title,
      path: currentRoute,
      isActive: currentRoute === currentPath
    });
    
    currentRoute = backPath;
  }
  
  // Add home if not already there
  if (breadcrumbs.length === 0 || breadcrumbs[0].path !== '/') {
    breadcrumbs.unshift({
      title: 'Main Screen',
      path: '/',
      isActive: currentPath === '/'
    });
  }
  
  return breadcrumbs;
}

/**
 * Hook to use structured navigation
 */
export function useStructuredNavigation() {
  return {
    getBackPath,
    getPageTitle,
    getBreadcrumbs,
  };
}