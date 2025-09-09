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
import { AuthService } from '@/lib/firebase/auth';

// Mock data - replace with Firebase data later
const mockStores = [
  {
    id: '1',
    name: 'Coffee Corner',
    description: 'Fresh coffee and pastries daily',
    rating: 4.5,
    logoUrl: '/api/placeholder/80/80',
    category: 'Coffee',
    isOpen: true,
    openTime: '7:00 AM',
    closeTime: '9:00 PM',
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Tech Repairs Hub',
    description: 'Professional device repair services',
    rating: 4.8,
    logoUrl: '/api/placeholder/80/80',
    category: 'Tech',
    isOpen: true,
    openTime: '9:00 AM',
    closeTime: '6:00 PM',
    isFavorite: true,
  },
  {
    id: '3',
    name: 'Beauty Salon Elite',
    description: 'Premium beauty and wellness services',
    rating: 4.7,
    logoUrl: '/api/placeholder/80/80',
    category: 'Beauty',
    isOpen: false,
    openTime: '10:00 AM',
    closeTime: '8:00 PM',
    isFavorite: false,
  },
];

const filterCategories = [
  'All', 'Featured', 'Popular', 'Coffee', 'Tech', 'Beauty', 'Services', 'Products', 'Open Now'
];

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const { totalItems } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [stores, setStores] = useState(mockStores);

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
        case 'Featured': return store.isFavorite;
        case 'Popular': return store.rating >= 4.5;
        case 'Open Now': return store.isOpen;
        default: return store.category === selectedCategory;
      }
    })();

    return matchesQuery && matchesCategory;
  });

  const toggleFavorite = (storeId: string) => {
    setStores(prev => prev.map(store => 
      store.id === storeId 
        ? { ...store, isFavorite: !store.isFavorite }
        : store
    ));
  };

  return (
    <div className="min-h-screen bg-neu-bg-primary">
      {/* Top App Bar */}
      <header className="bg-white neu-shadow-md px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neu-text-primary">MyHustle</h1>
          
          <div className="flex items-center gap-4">
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
                          fill={store.isFavorite ? '#ef4444' : 'none'}
                          color={store.isFavorite ? '#ef4444' : 'currentColor'}
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
                        store.isOpen 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {store.isOpen ? 'Open' : 'Closed'}
                      </span>
                      <span className="text-gray-500">
                        {store.openTime} - {store.closeTime}
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
