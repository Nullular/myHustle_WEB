'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Settings, 
  LogOut,
  Star,
  Heart,
  Plus,
  Filter,
  ChevronDown,
} from 'lucide-react';

import { NeuButton, NeuCard, NeuInput } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { useShops } from '@/hooks/useShops';
import { AuthService } from '@/lib/firebase/auth';

const filterCategories = [
  'All', 'Featured', 'Popular', 'Coffee', 'Tech', 'Beauty', 'Services', 'Products', 'Open Now'
];

export default function Home() {
  const { user } = useAuthStore();
  const { totalItems } = useCartStore();
  const { shops, loading, error } = useShops();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Business hours helper function
  const isShopOpen = (shop: any): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [openHour, openMin] = shop.openTime24?.split(':').map(Number) || [0, 0];
    const [closeHour, closeMin] = shop.closeTime24?.split(':').map(Number) || [23, 59];
    
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;
    
    return currentTime >= openTime && currentTime < closeTime;
  };

  // Generate dynamic categories from actual shop data
  const dynamicCategories = [
    'All', 
    'Featured', 
    'Popular', 
    'Open Now',
    ...Array.from(new Set(shops.map(shop => shop.category)))
  ];

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesQuery = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        shop.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = (() => {
      switch (selectedCategory) {
        case 'All': return true;
        case 'Featured': return shop.rating >= 4.5; // Consider high-rated as featured
        case 'Popular': return shop.rating >= 4.5;
        case 'Open Now': return isShopOpen(shop);
        default: return shop.category === selectedCategory;
      }
    })();

    return matchesQuery && matchesCategory;
  });

  const toggleFavorite = async (shopId: string) => {
    if (!user) return;
    
    // For now, just update local state - can implement Firebase favorites later
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(shopId)) {
        newFavorites.delete(shopId);
      } else {
        newFavorites.add(shopId);
      }
      return newFavorites;
    });
  };

const filterCategories = [
  'All', 'Featured', 'Popular', 'Coffee', 'Tech', 'Beauty', 'Services', 'Products', 'Open Now'
];

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const { totalItems } = useCartStore();
  const { stores, loading, error } = useStores();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Extract categories from actual store data
  const filterCategories = [
    'All', 
    'Featured', 
    'Popular', 
    'Open Now',
    ...new Set(stores.map(store => store.category))
  ];

  // Load user favorites
  useEffect(() => {
    if (user && stores.length > 0) {
      const userFavorites = new Set<string>();
      stores.forEach(store => {
        if (store.favoriteUserIds?.includes(user.uid)) {
          userFavorites.add(store.id);
        }
      });
      setFavorites(userFavorites);
    }
  }, [user, stores]);

  // Debug Firebase connection
  const testFirebaseConnection = async () => {
    console.log('🔥 Testing Firebase connection manually...');
    await FirebaseTestService.testConnection();
    await FirebaseTestService.testCollections();
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesQuery = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        store.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = (() => {
      switch (selectedCategory) {
        case 'All': return true;
        case 'Featured': return favorites.has(store.id);
        case 'Popular': return store.rating >= 4.5;
        case 'Open Now': return storeService.isStoreOpen(store);
        default: return store.category === selectedCategory;
      }
    })();

    return matchesQuery && matchesCategory;
  });

  const toggleFavorite = async (storeId: string) => {
    if (!user) return;
    
    try {
      const isFavorite = favorites.has(storeId);
      const success = await storeService.toggleFavorite(storeId, user.uid, !isFavorite);
      
      if (success) {
        const newFavorites = new Set(favorites);
        if (isFavorite) {
          newFavorites.delete(storeId);
        } else {
          newFavorites.add(storeId);
        }
        setFavorites(newFavorites);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  return (
    <div className="min-h-screen bg-neu-bg-primary">
      {/* Top App Bar */}
      <header className="bg-white neu-shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neu-text-primary">MyHustle</h1>
          
          <div className="flex items-center gap-4">
            {/* Test Data Button - Dev Only */}
            <Link href="/test-data">
              <NeuButton className="px-4 py-2 bg-purple-500 text-white hover:bg-purple-600">
                🧪 Test Data
              </NeuButton>
            </Link>
            
            {/* Cart Button */}
            <Link href="/cart" className="relative">
              <NeuButton variant="hover" className="p-3">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </NeuButton>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <NeuButton 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2"
                >
                  <User size={20} />
                  {user?.displayName || 'User'}
                  <ChevronDown size={16} />
                </NeuButton>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 neu-card py-2 z-50">
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                    >
                      <User size={16} /> Profile
                    </Link>
                    {user?.userType === 'business_owner' && (
                      <Link 
                        href="/dashboard" 
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                      >
                        <Settings size={16} /> Store Management
                      </Link>
                    )}
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <NeuButton className="flex items-center gap-2">
                  <User size={20} />
                  Sign In
                </NeuButton>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Section */}
        <div className="mb-6">
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for stores, services, or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neu-input pl-12 w-full"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'neu-button'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Store Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Link key={store.id} href={`/store/${store.id}`}>
              <NeuCard className="p-6 cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0">
                    {/* Placeholder for store logo */}
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-lg text-neu-text-primary">
                        {store.name}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(store.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Heart 
                          size={20} 
                          fill={favorites.has(store.id) ? '#ef4444' : 'none'}
                          color={favorites.has(store.id) ? '#ef4444' : 'currentColor'}
                        />
                      </button>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-2">
                      {store.description}
                    </p>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span className="text-sm font-medium">{store.rating}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        storeService.isStoreOpen(store)
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {storeService.isStoreOpen(store) ? 'Open' : 'Closed'}
                      </span>
                      <span className="text-gray-500">
                        {store.openTime24 && store.closeTime24 ? 
                          `${storeService.formatTime(store.openTime24)} - ${storeService.formatTime(store.closeTime24)}` :
                          'Hours not available'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </NeuCard>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No stores found matching your criteria
            </p>
            <NeuButton onClick={() => setSelectedCategory('All')}>
              Clear Filters
            </NeuButton>
          </div>
        )}

        {/* Floating Action Button (for business owners) */}
        {user?.userType === 'business_owner' && (
          <Link 
            href="/create-store"
            className="fixed bottom-6 right-6 z-40"
          >
            <NeuButton className="w-14 h-14 rounded-full p-0 flex items-center justify-center">
              <Plus size={24} />
            </NeuButton>
          </Link>
        )}
      </main>
    </div>
  );
}
