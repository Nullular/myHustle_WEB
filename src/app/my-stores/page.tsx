'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, 
  Plus, 
  ArrowLeft,
  Home,
  Star,
  Clock,
  MapPin,
  Users,
  TrendingUp,
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useOwnedShops } from '@/hooks/useOwnedShops';
import { useAuthStore } from '@/lib/store/auth';
import { Shop } from '@/types';

export default function MyStoresPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { shops, loading, error, refetch } = useOwnedShops();

  // Helper function to check if shop is currently open
  const isShopOpen = (shop: Shop): boolean => {
    if (!shop.openTime24 || !shop.closeTime24) return true;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [openHour, openMin] = shop.openTime24.split(':').map(Number);
    const [closeHour, closeMin] = shop.closeTime24.split(':').map(Number);
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    // Handle overnight hours (close time < open time)
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime <= closeTime;
    }
    
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const handleStoreSelect = (shop: Shop) => {
    // Navigate to store management page directly
    router.push(`/store/${shop.id}/manage`);
  };

  const handleCreateStore = () => {
    // Navigate to create store page (will be created later)
    router.push('/create-store');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <NeuCard className="p-8 text-center max-w-md mx-auto">
          <Store className="mx-auto mb-4 text-blue-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view and manage your stores.
          </p>
          <NeuButton onClick={() => router.push('/login')}>
            Login
          </NeuButton>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <NeuButton
                variant="default"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:block">Back</span>
              </NeuButton>
              
              <NeuButton
                variant="default"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2"
              >
                <Home size={20} />
                <span className="hidden sm:block">Main Screen</span>
              </NeuButton>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Stores</h1>
              <p className="text-gray-600 text-sm hidden sm:block">
                Manage your business locations
              </p>
            </div>
          </div>
          
          <NeuButton
            onClick={handleCreateStore}
            className="flex items-center space-x-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Create Store</span>
          </NeuButton>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <NeuCard className="p-8 text-center max-w-md mx-auto">
            <div className="text-red-500 mb-4">
              <Store size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Stores</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <NeuButton onClick={refetch}>
              Try Again
            </NeuButton>
          </NeuCard>
        )}

        {/* Empty State */}
        {!loading && !error && shops.length === 0 && (
          <NeuCard className="p-12 text-center max-w-2xl mx-auto">
            <Store className="mx-auto mb-6 text-blue-400" size={80} />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Stores Yet</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Create your first store to start managing your business on MyHustle
            </p>
            <NeuButton 
              onClick={handleCreateStore}
              className="inline-flex items-center space-x-3"
            >
              <Store size={24} />
              <span>Create Your First Store</span>
            </NeuButton>
          </NeuCard>
        )}

        {/* Stores List */}
        {!loading && !error && shops.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Select a store to manage:
              </h2>
              <p className="text-gray-600">
                You have {shops.length} store{shops.length !== 1 ? 's' : ''} registered
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => handleStoreSelect(shop)}
                  className="text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
                >
                  <NeuCard 
                    className="p-6 hover:scale-[1.02] transition-all duration-300 group w-full"
                  >
                  <div className="flex items-start space-x-4">
                    {/* Store Logo */}
                    <div className="flex-shrink-0">
                      {shop.logoUrl && !shop.logoUrl.startsWith('content://') ? (
                        <img
                          src={shop.logoUrl}
                          alt={`${shop.name} logo`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <Store className="text-white" size={24} />
                        </div>
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                            {shop.name}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {shop.description}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <div className="flex flex-col items-end space-y-1">
                          {shop.active ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isShopOpen(shop) 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {isShopOpen(shop) ? 'Open' : 'Closed'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Inactive
                            </span>
                          )}
                          
                          {shop.isVerified && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Store Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Star size={16} className="text-yellow-500" />
                          <span className="text-sm">{shop.rating.toFixed(1)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Users size={16} />
                          <span className="text-sm">{shop.totalReviews} reviews</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin size={16} />
                          <span className="text-sm truncate">{shop.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock size={16} />
                          <span className="text-sm">
                            {shop.openTime24 && shop.closeTime24 
                              ? `${shop.openTime24} - ${shop.closeTime24}`
                              : '24/7'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Category */}
                      {shop.category && (
                        <div className="mt-3">
                          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                            {shop.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </NeuCard>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
