/**
 * Demo authentication utilities for testing the login/signup flow
 * Creates demo users that can be used to test the authentication system
 */

import { User, UserType } from '@/types/models';

export const DEMO_USERS = {
  customer: {
    email: 'customer@myhustle.demo',
    password: 'demo123',
    displayName: 'Demo Customer',
    userType: UserType.CUSTOMER,
  },
  businessOwner: {
    email: 'business@myhustle.demo', 
    password: 'demo123',
    displayName: 'Demo Business Owner',
    userType: UserType.BUSINESS_OWNER,
  }
};

// Real shop owner accounts that should exist in the database
export const REAL_SHOP_OWNERS = {
  shopOwner1: {
    email: 'owner1@myhustle.app',
    password: 'myhustle123',
    displayName: 'Shop Owner 1',
    userType: UserType.BUSINESS_OWNER,
  },
  shopOwner2: {
    email: 'owner2@myhustle.app',
    password: 'myhustle123', 
    displayName: 'Shop Owner 2',
    userType: UserType.BUSINESS_OWNER,
  },
  shopOwner3: {
    email: 'owner3@myhustle.app',
    password: 'myhustle123',
    displayName: 'Shop Owner 3', 
    userType: UserType.BUSINESS_OWNER,
  }
};

/**
 * Create demo users in Firebase Authentication (for development only)
 */
export async function createDemoUsers(): Promise<void> {
  // This would typically be run in a setup script or admin panel
  console.log('Demo users available for testing:', DEMO_USERS);
  console.log('Use these credentials to test the login flow');
}

/**
 * Quick login helper for development
 */
export function getDemoCredentials(userType: 'customer' | 'businessOwner') {
  return {
    email: DEMO_USERS[userType].email,
    password: DEMO_USERS[userType].password,
  };
}

/**
 * Get real shop owner credentials for testing
 */
export function getRealShopOwnerCredentials(ownerId?: string) {
  const credentials = Object.values(REAL_SHOP_OWNERS);
  if (ownerId) {
    // Try to find specific owner
    return credentials[0]; // Default to first for now
  }
  return credentials;
}
