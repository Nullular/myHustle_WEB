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
} from 'lucide-react';
import { Shop, User, UserType } from '@/types/models';

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

// This is a placeholder for the mobile view.
// The actual content from page.tsx will be moved here.
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
      {/* Simplified Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-2">
              <Store className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">MyHustle</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/cart">
                <div className="relative p-2">
                  <ShoppingCart className="h-6 w-6 text-gray-600" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="p-2" aria-label="Open user menu">
                <UserIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        {showUserMenu && (
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
            {/* User menu content here, simplified for mobile */}
          </div>
        )}
      </header>

      {/* Mobile Main Content */}
      <main className="p-4">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="w-full flex justify-between items-center px-4 py-2 bg-white border rounded-lg"
          >
            <span>{selectedCategory}</span>
            <ChevronDown className="h-5 w-5" />
          </button>
          {showFilterDropdown && (
            <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-30">
              {filterCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowFilterDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredShops.map((shop) => (
            <Link href={`/store/${shop.id}`} key={shop.id}>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="h-32 bg-gray-200 relative">
                  {shop.logoUrl && !shop.logoUrl.startsWith('content://') ? (
                    <img src={shop.logoUrl} alt={shop.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-2xl font-bold">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                  <button
                    aria-label="Toggle favorite"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(shop.id);
                    }}
                    className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow"
                  >
                    <Heart
                      className={`w-5 h-5 ${favorites.has(shop.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{shop.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{shop.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm font-medium">{shop.rating.toFixed(1)}</span>
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
            <p>No shops found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
