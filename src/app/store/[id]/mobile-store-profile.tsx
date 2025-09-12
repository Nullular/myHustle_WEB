'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Share, 
  Heart, 
  Star, 
  MapPin, 
  Phone,
  ChevronRight
} from 'lucide-react';
import { Shop, Product, Service } from '@/types';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface MobileStoreProfileProps {
    router: AppRouterInstance;
    shop: Shop;
    products: Product[];
    services: Service[];
    isFavorite: boolean;
    toggleFavorite: () => void;
    handleShare: () => void;
    getProductImageUrl: (item: Product) => string | null;
    getServiceImageUrl: (item: Service) => string | null;
}

export default function MobileStoreProfileScreen({
  router,
  shop,
  products,
  services,
  isFavorite,
  toggleFavorite,
  handleShare,
  getProductImageUrl,
  getServiceImageUrl,
}: MobileStoreProfileProps) {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="relative h-48 bg-gray-300">
        {shop.bannerUrl ? (
          <img src={shop.bannerUrl} alt={`${shop.name} banner`} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-white font-bold text-lg bg-gradient-to-r from-blue-500 to-purple-600">
            {shop.name}
          </div>
        )}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button aria-label="Go back" onClick={() => router.back()} className="bg-white/80 p-2 rounded-full shadow">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex space-x-2">
            <button aria-label="Share" onClick={handleShare} className="bg-white/80 p-2 rounded-full shadow">
              <Share className="h-5 w-5 text-gray-700" />
            </button>
            <button aria-label="Toggle favorite" onClick={toggleFavorite} className="bg-white/80 p-2 rounded-full shadow">
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="bg-white p-4 -mt-10 rounded-t-2xl shadow-lg">
        <div className="flex items-end space-x-4">
          <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md -mt-10 bg-gray-200">
            {shop.logoUrl && !shop.logoUrl.startsWith('content://') ? (
              <img src={shop.logoUrl} alt={`${shop.name} logo`} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="flex items-center justify-center h-full text-white font-bold text-lg bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                {shop.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{shop.name}</h1>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
              <span>{shop.rating.toFixed(1)}</span>
              <span className="ml-2">{shop.category}</span>
            </div>
          </div>
        </div>
        <p className="mt-4 text-gray-700">{shop.description}</p>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-4">
        {/* Products */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-2">Products</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {products.map((item) => (
                <Link href={`/item/${item.id}`} key={`product-${item.id}`} className="flex-shrink-0 w-32">
                  <div className="rounded-lg overflow-hidden border">
                    <div className="h-24 bg-gray-200">
                      {getProductImageUrl(item) && (
                        <img src={getProductImageUrl(item) ?? '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      <p className="text-xs text-gray-600">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {services.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-2">Services</h2>
            <div className="space-y-2">
              {services.map((item) => (
                <Link href={`/service/${item.id}`} key={`service-${item.id}`}>
                  <div className="flex items-center p-2 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden mr-4">
                      {getServiceImageUrl(item) && (
                        <img src={getServiceImageUrl(item) ?? '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">${item.basePrice.toFixed(2)}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-bold mb-2">Contact</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-700">{shop.address || shop.location}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-gray-700">{shop.phone}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
