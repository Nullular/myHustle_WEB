import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  User as UserIcon, 
  Star,
  Heart,
  Filter,
  Store,
  ChevronDown,
  Settings,
  LogOut,
  Plus,
  MessageCircle,
} from 'lucide-react';
import FavoriteButton from '../components/ui/FavoriteButton';
import { Shop, User, UserType } from '@/types/models';
import FeaturedStores from '@/components/ui/FeaturedStores';

interface MobileMainScreenProps {
  user: (User & { displayName?: string | null; email?: string | null; userType?: UserType }) | null;
  totalItems: number;
  shops: Shop[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  favorites: Set<string>;
  toggleFavorite: (shopId: string) => void;
  isShopOpen: (shop: Shop) => boolean;
  filterCategories: string[];
  filteredShops: Shop[];
  handleSignOut: () => void;
}

export default function MobileMainScreen({
  user,
  totalItems,
  shops,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showUserMenu,
  setShowUserMenu,
  favorites,
  toggleFavorite,
  isShopOpen,
  filterCategories,
  filteredShops,
  handleSignOut,
}: MobileMainScreenProps) {
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Neumorphic Mobile Header */}
      <header className="neu-card sticky top-0 z-40 p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="neu-pressed w-10 h-10 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">MyHustle</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/cart" className="neu-card p-1.5 rounded-lg relative">
              <ShoppingCart className="h-4 w-4 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="neu-card p-1.5 rounded-lg" aria-label="Open user menu">
                <UserIcon className="h-4 w-4 text-gray-600" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 neu-card rounded-lg shadow-lg z-50 p-2">
                  {user ? (
                    <>
                      <div className="neu-pressed rounded-md p-2 text-center mb-2">
                        <p className="text-sm font-medium text-gray-800">{user.displayName || user.email}</p>
                      </div>
                      <Link href="/profile" className="neu-hover-button w-full justify-start text-sm mb-1">
                        <Settings className="h-4 w-4 mr-2" /> Profile
                      </Link>
                      <Link href="/my-stores" className="neu-hover-button w-full justify-start text-sm mb-1">
                        <Store className="h-4 w-4 mr-2" /> My Stores
                      </Link>
                      <Link href="/messages" className="neu-hover-button w-full justify-start text-sm mb-1">
                        <MessageCircle className="h-4 w-4 mr-2" /> Messages
                      </Link>
                      <button onClick={handleSignOut} className="neu-hover-button w-full justify-start text-sm text-red-600 mt-1 pt-1 border-t border-gray-200">
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="neu-hover-button w-full justify-center text-sm mb-1">
                        Sign In
                      </Link>
                      <Link href="/signup" className="neu-hover-button w-full justify-center text-sm">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Main Content */}
      <main className="p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
          <input
            type="text"
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="neu-input w-full pl-12 pr-4 py-3 text-base rounded-lg"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0 w-6 flex justify-center">
            <Filter className="h-6 w-6 text-gray-400" />
          </div>
          <div className="flex-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="neu-input w-full py-2 px-3 text-sm rounded-lg bg-white border-0 focus:ring-2 focus:ring-blue-500"
              title="Filter by category"
              aria-label="Filter shops by category"
            >
              {filterCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-shrink-0 w-6">
            {/* Spacer for symmetry */}
          </div>
        </div>

        <div className="my-4">
          <FeaturedStores shops={shops} />
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredShops.map((shop) => (
            <Link href={`/store/${shop.id}`} key={shop.id} className="block">
              <div className="neu-card rounded-lg overflow-hidden">
                <div className="h-36 bg-gray-200 relative">
                  <img src={shop.logoUrl && (shop.logoUrl.startsWith('http') || shop.logoUrl.startsWith('/')) ? shop.logoUrl : '/placeholder.svg'} alt={shop.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <FavoriteButton
                      isFavorite={favorites.has(shop.id)}
                      toggleFavorite={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(shop.id); }}
                      size={25}
                    />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-md">{shop.name}</h3>
                  <p className="text-xs text-gray-600 truncate">{shop.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center neu-pressed px-2 py-1 rounded-md">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-xs font-bold">{shop.rating.toFixed(1)}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isShopOpen(shop) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {isShopOpen(shop) ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filteredShops.length === 0 && (
          <div className="text-center py-10">
            <div className="neu-pressed w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">No Shops Found</h3>
            <p className="text-sm text-gray-500">Try a different search or filter.</p>
          </div>
        )}
      </main>
      {user?.userType === 'BUSINESS_OWNER' && (
        <Link href="/create-store">
          <div className="fixed bottom-4 right-4 neu-card p-4 rounded-full shadow-lg">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
        </Link>
      )}
    </div>
  );
}
