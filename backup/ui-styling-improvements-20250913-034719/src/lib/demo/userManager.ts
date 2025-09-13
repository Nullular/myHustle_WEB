/**
 * User Management System for Database Integration
 * Creates Firebase Auth accounts for existing shop owners and data
 */

import { AuthService } from '@/lib/firebase/auth';
import { shopRepository } from '@/lib/firebase/repositories';
import { UserType } from '@/types/models';

export const EXISTING_USERS = {
  // Based on shop data, create accounts for shop owners
  shopOwner1: {
    email: 'owner1@myhustle.shop',
    password: 'shopowner123',
    displayName: 'Shop Owner 1',
    userType: UserType.BUSINESS_OWNER,
  },
  shopOwner2: {
    email: 'owner2@myhustle.shop', 
    password: 'shopowner123',
    displayName: 'Shop Owner 2',
    userType: UserType.BUSINESS_OWNER,
  },
  shopOwner3: {
    email: 'owner3@myhustle.shop',
    password: 'shopowner123', 
    displayName: 'Shop Owner 3',
    userType: UserType.BUSINESS_OWNER,
  },
  customer1: {
    email: 'customer1@myhustle.app',
    password: 'customer123',
    displayName: 'Test Customer',
    userType: UserType.CUSTOMER,
  }
};

/**
 * Gets real shop data and creates corresponding user accounts
 */
export async function getShopOwnersFromDatabase() {
  try {
    const shops = await shopRepository.getActiveShops();
    console.log('🏪 Found shops:', shops.map(s => ({ id: s.id, name: s.name, ownerId: s.ownerId })));
    
    return shops.map((shop, index) => ({
      shopId: shop.id,
      shopName: shop.name,
      ownerId: shop.ownerId,
      suggestedEmail: `owner.${shop.name.toLowerCase().replace(/\s+/g, '')}@myhustle.shop`,
      suggestedPassword: 'myhustle2025',
      displayName: `${shop.name} Owner`,
    }));
  } catch (error) {
    console.error('❌ Error fetching shop owners:', error);
    return [];
  }
}

/**
 * Create test users that match existing shop data
 */
export async function createTestUsers() {
  const shopOwners = await getShopOwnersFromDatabase();
  const results = [];
  
  for (const owner of shopOwners) {
    try {
      console.log(`📝 Creating user for ${owner.shopName}...`);
      
      // Try to create the user account
      const userData = {
        email: owner.suggestedEmail,
        password: owner.suggestedPassword,
        confirmPassword: owner.suggestedPassword,
        displayName: owner.displayName,
        userType: UserType.BUSINESS_OWNER,
        agreeToTerms: true,
      };
      
      const user = await AuthService.signUp(userData);
      console.log(`✅ Created user: ${user.email} for shop: ${owner.shopName}`);
      
      results.push({
        success: true,
        email: owner.suggestedEmail,
        shopName: owner.shopName,
        shopId: owner.shopId,
      });
      
    } catch (error) {
      console.log(`⚠️ User might already exist: ${owner.suggestedEmail}`);
      results.push({
        success: false,
        email: owner.suggestedEmail,
        shopName: owner.shopName,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return results;
}

/**
 * Get login credentials for existing shop owners
 */
export function getShopOwnerCredentials(shopName?: string) {
  const credentials = [
    { email: 'owner.techelectronics@myhustle.shop', password: 'myhustle2025', shopName: 'Tech Electronics' },
    { email: 'owner.freshbites@myhustle.shop', password: 'myhustle2025', shopName: 'Fresh Bites' },
    { email: 'owner.stylehub@myhustle.shop', password: 'myhustle2025', shopName: 'Style Hub' },
  ];
  
  if (shopName) {
    return credentials.find(c => c.shopName.toLowerCase().includes(shopName.toLowerCase()));
  }
  
  return credentials;
}
