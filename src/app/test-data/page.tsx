'use client';

import React, { useState } from 'react';
import { useShops, useProducts, useFavorites } from '@/hooks/useStore';
import { useAuthStore } from '@/lib/store/auth';
import { shopRepository, productRepository, serviceRepository, favoriteRepository } from '@/lib/firebase/repositories';
import { FavoriteTargetType } from '@/types/models';
import { AuthService } from '@/lib/firebase/auth';

/**
 * Test component to verify all data connections work
 * This tests all repositories and hooks against the Firebase database
 */
export default function DataConnectionTest() {
  const { user } = useAuthStore();
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  
  // Test hooks
  const { shops, loading: shopsLoading, error: shopsError } = useShops();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { favorites, loading: favoritesLoading, error: favoritesError } = useFavorites(user?.id || null);
  
  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    try {
      console.log(`🧪 Testing ${testName}...`);
      const startTime = Date.now();
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          status: 'success',
          result,
          duration: `${duration}ms`,
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      
      console.log(`✅ ${testName} completed successfully in ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`❌ ${testName} failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toLocaleTimeString()
        }
      }));
      throw error;
    }
  };
  
  const runAllTests = async () => {
    setLoading(true);
    setTestResults({});
    
    try {
      // Test 1: Shop Repository - Get Active Shops
      await runTest('Shop Repository: Get Active Shops', async () => {
        const shops = await shopRepository.getActiveShops();
        return {
          count: shops.length,
          sampleShop: shops[0] ? {
            id: shops[0].id,
            name: shops[0].name,
            hasOpenTime: !!shops[0].openTime24,
            hasCloseTime: !!shops[0].closeTime24,
            isActive: shops[0].active
          } : null
        };
      });
      
      // Test 2: Business Hours Logic
      if (shops.length > 0) {
        await runTest('Business Hours Logic', async () => {
          const testShop = shops[0];
          const isOpen = shopRepository.isStoreOpen(testShop);
          const status = shopRepository.getStoreStatus(testShop);
          return {
            shopName: testShop.name,
            openTime24: testShop.openTime24,
            closeTime24: testShop.closeTime24,
            isOpen,
            status: status.status,
            nextTime: status.nextTime
          };
        });
      }
      
      // Test 3: Get Shop by ID
      if (shops.length > 0) {
        await runTest('Shop Repository: Get by ID', async () => {
          const shopId = shops[0].id;
          const shop = await shopRepository.getShopById(shopId);
          return {
            requestedId: shopId,
            foundShop: shop ? {
              id: shop.id,
              name: shop.name,
              matchesId: shop.id === shopId
            } : null
          };
        });
      }
      
      // Test 4: Product Repository
      await runTest('Product Repository: Get Active Products', async () => {
        const products = await productRepository.getActiveProducts();
        return {
          count: products.length,
          sampleProduct: products[0] ? {
            id: products[0].id,
            name: products[0].name,
            shopId: products[0].shopId,
            active: products[0].active,
            price: products[0].price
          } : null
        };
      });
      
      // Test 5: Products by Shop
      if (shops.length > 0) {
        await runTest('Product Repository: Get by Shop', async () => {
          const shopId = shops[0].id;
          const products = await productRepository.getProductsByShop(shopId);
          return {
            shopId,
            shopName: shops[0].name,
            productCount: products.length,
            products: products.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price
            }))
          };
        });
      }
      
      // Test 6: Service Repository
      await runTest('Service Repository: Get Active Services', async () => {
        const services = await serviceRepository.getActiveServices();
        return {
          count: services.length,
          sampleService: services[0] ? {
            id: services[0].id,
            name: services[0].name,
            shopId: services[0].shopId,
            active: services[0].active,
            basePrice: services[0].basePrice
          } : null
        };
      });
      
      // Test 7: Services by Shop
      if (shops.length > 0) {
        await runTest('Service Repository: Get by Shop', async () => {
          const shopId = shops[0].id;
          const services = await serviceRepository.getServicesByShop(shopId);
          return {
            shopId,
            shopName: shops[0].name,
            serviceCount: services.length,
            services: services.map(s => ({
              id: s.id,
              name: s.name,
              basePrice: s.basePrice
            }))
          };
        });
      }
      
      // Test 8: Favorites (only if user is authenticated)
      if (user) {
        await runTest('Favorite Repository: Get User Favorites', async () => {
          const favorites = await favoriteRepository.getUserFavorites(user.id);
          return {
            userId: user.id,
            favoriteCount: favorites.length,
            favorites: favorites.map(f => ({
              id: f.id,
              targetType: f.targetType,
              targetName: f.targetName
            }))
          };
        });
        
        // Test 9: Toggle Favorite (if we have shops)
        if (shops.length > 0) {
          await runTest('Favorite Repository: Toggle Favorite', async () => {
            const testShop = shops[0];
            const initialStatus = await favoriteRepository.isFavorited(
              user.id, 
              FavoriteTargetType.SHOP, 
              testShop.id
            );
            
            // Toggle favorite
            const toggleResult = await favoriteRepository.toggleFavorite(
              user.id,
              FavoriteTargetType.SHOP,
              testShop.id,
              testShop.name,
              testShop.imageUrl || '',
              testShop.id,
              testShop.name
            );
            
            const newStatus = await favoriteRepository.isFavorited(
              user.id,
              FavoriteTargetType.SHOP,
              testShop.id
            );
            
            // Toggle back to original state
            await favoriteRepository.toggleFavorite(
              user.id,
              FavoriteTargetType.SHOP,
              testShop.id,
              testShop.name,
              testShop.imageUrl || '',
              testShop.id,
              testShop.name
            );
            
            return {
              shopName: testShop.name,
              initialStatus,
              toggleResult,
              newStatus,
              statusChanged: initialStatus !== newStatus
            };
          });
        }
      }
      
      console.log('🎉 All tests completed successfully!');
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults({});
  };  return (
    <div className="min-h-screen bg-neu-bg-primary p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white neu-shadow-lg rounded-3xl p-8">
          <h1 className="text-3xl font-bold mb-8 text-center">
            🧪 Firebase Data Connection Test Suite
          </h1>
          
          {/* Test Controls */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </button>
            
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600"
            >
              🗑️ Clear Results
            </button>
          </div>
          
          {/* Hook Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Shops Hook</h3>
              <div className={`text-sm ${shopsLoading ? 'text-yellow-600' : shopsError ? 'text-red-600' : 'text-green-600'}`}>
                {shopsLoading ? '🔄 Loading...' : shopsError ? `❌ ${shopsError}` : `✅ ${shops.length} shops loaded`}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Products Hook</h3>
              <div className={`text-sm ${productsLoading ? 'text-yellow-600' : productsError ? 'text-red-600' : 'text-green-600'}`}>
                {productsLoading ? '🔄 Loading...' : productsError ? `❌ ${productsError}` : `✅ ${products.length} products loaded`}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-semibold mb-2">Favorites Hook</h3>
              <div className={`text-sm ${favoritesLoading ? 'text-yellow-600' : favoritesError ? 'text-red-600' : user ? 'text-green-600' : 'text-gray-500'}`}>
                {!user ? '👤 Not authenticated' : favoritesLoading ? '🔄 Loading...' : favoritesError ? `❌ ${favoritesError}` : `✅ ${favorites.length} favorites loaded`}
              </div>
            </div>
          </div>
          
          {/* Test Results */}
          <div className="space-y-4">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{testName}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded ${
                      result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status === 'success' ? '✅ Success' : '❌ Error'}
                    </span>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                    {result.duration && (
                      <span className="text-xs text-blue-600">{result.duration}</span>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(result.status === 'success' ? result.result : result.error, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
          
          {Object.keys(testResults).length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Click "Run All Tests" to start testing data connections
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
