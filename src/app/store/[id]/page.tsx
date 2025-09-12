'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Share, 
  Heart, 
  Star, 
  MapPin, 
  Phone, 
  Clock,
  Calendar,
  ShoppingCart
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { useShopProducts, useShopServices } from '@/hooks/useProducts';
import { shopRepository } from '@/lib/firebase/repositories';

interface StoreProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function StoreProfilePage({ params }: StoreProfilePageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState<string>('');
  const { shop, loading, error } = useShop(storeId);
  const { products, loading: productsLoading } = useShopProducts(storeId);
  const { services, loading: servicesLoading } = useShopServices(storeId);
  const [isFavorite, setIsFavorite] = useState(false);

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => {
      console.log('🏪 Store page - Resolved shop ID:', id);
      setStoreId(id);
    });
  }, [params]);

  // Debug logging for product images
  useEffect(() => {
    if (products && products.length > 0) {
      console.log('🛍️ Products data:', products);
      console.log('🖼️ First product imageUrls:', products[0]?.imageUrls);
      console.log('🖼️ First product primaryImageUrl:', products[0]?.primaryImageUrl);
      console.log('🖼️ Sample image URL:', products[0]?.imageUrls?.[0] || products[0]?.primaryImageUrl);
    }
  }, [products]);

  // Debug logging for service data
  useEffect(() => {
    if (services && services.length > 0) {
      console.log('🔧 Services data:', services);
      console.log('🖼️ First service imageUrls:', services[0]?.imageUrls);
      console.log('🖼️ First service primaryImageUrl:', services[0]?.primaryImageUrl);
      console.log('🔧 Sample service:', services[0]?.name, 'Price:', services[0]?.basePrice);
    }
  }, [services]);

  // Helper function to get product image URL
  const getProductImageUrl = (item: any) => {
    // Try different possible image field names
    if (item.imageUrls && item.imageUrls.length > 0) {
      const validUrl = item.imageUrls.find((url: string) => !url.startsWith('content://'));
      if (validUrl) return validUrl;
    }
    if (item.primaryImageUrl && !item.primaryImageUrl.startsWith('content://')) {
      return item.primaryImageUrl;
    }
    if (item.imageUrl && !item.imageUrl.startsWith('content://')) {
      return item.imageUrl;
    }
    if (item.image && !item.image.startsWith('content://')) {
      return item.image;
    }
    return null;
  };

  // Helper function to get service image URL
  const getServiceImageUrl = (item: any) => {
    // Try different possible image field names for services
    if (item.imageUrls && item.imageUrls.length > 0) {
      const validUrl = item.imageUrls.find((url: string) => !url.startsWith('content://'));
      if (validUrl) return validUrl;
    }
    if (item.primaryImageUrl && !item.primaryImageUrl.startsWith('content://')) {
      return item.primaryImageUrl;
    }
    if (item.imageUrl && !item.imageUrl.startsWith('content://')) {
      return item.imageUrl;
    }
    if (item.image && !item.image.startsWith('content://')) {
      return item.image;
    }
    return null;
  };

  // Business hours helper - matches Android logic exactly
  const getStoreStatus = (shop: any) => {
    if (!shop || !shop.openTime24 || !shop.closeTime24) {
      return { statusList: ['Hours unavailable'], isOpen: false };
    }

    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentMinutes = currentHour * 60 + currentMinute;

      const [openH, openM] = shop.openTime24.split(':').map((x: string) => parseInt(x) || 8);
      const [closeH, closeM] = shop.closeTime24.split(':').map((x: string) => parseInt(x) || 18);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH === 24 && closeM === 0 ? 24 * 60 : closeH * 60 + closeM;

      const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

      if (isOpen) {
        const closeTimeFormatted = closeH === 24 && closeM === 0 
          ? '12:00 AM'
          : `${closeH > 12 ? closeH - 12 : closeH || 12}:${closeM.toString().padStart(2, '0')} ${closeH < 12 ? 'AM' : 'PM'}`;
        return { statusList: ['Open Now', `Closes at ${closeTimeFormatted}`], isOpen: true };
      } else {
        const openTimeFormatted = `${openH > 12 ? openH - 12 : openH || 12}:${openM.toString().padStart(2, '0')} ${openH < 12 ? 'AM' : 'PM'}`;
        return { statusList: ['Closed', `Opens at ${openTimeFormatted}`], isOpen: false };
      }
    } catch {
      return { statusList: ['Hours unavailable'], isOpen: false };
    }
  };

  const storeStatus = useMemo(() => getStoreStatus(shop), [shop]);

  // Check favorite status
  useEffect(() => {
    if (shop && user) {
      setIsFavorite(shop.isFavorite || false);
    }
  }, [shop, user]);

  const toggleFavorite = async () => {
    if (!user || !shop) return;

    const newFavoriteState = !isFavorite;
    try {
      // TODO: Implement favorite functionality
      setIsFavorite(newFavoriteState);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && shop) {
      try {
        await navigator.share({
          title: shop.name,
          text: shop.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  const handleCall = () => {
    if (shop?.phone) {
      window.open(`tel:${shop.phone}`);
    }
  };

  if (!storeId || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading shop: {error || 'Shop not found'}</p>
          <NeuButton onClick={() => router.back()}>
            Go Back
          </NeuButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Banner - Matches Android exactly */}
      <div className="relative h-80 mb-4">
        {/* Banner Image */}
        <div className="relative h-48 w-full overflow-hidden rounded-b-2xl bg-gray-200">
          {shop.bannerUrl ? (
            <img
              src={shop.bannerUrl}
              alt={`${shop.name} banner`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold ${shop.bannerUrl ? 'hidden' : ''}`}>
            {shop.name}
          </div>
        </div>

        {/* Top Navigation */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          {/* Back Button */}
          <NeuButton
            onClick={() => router.back()}
            className="p-3 bg-white bg-opacity-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </NeuButton>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <NeuButton
              onClick={handleShare}
              className="p-3 bg-white bg-opacity-90"
            >
              <Share className="h-5 w-5" />
            </NeuButton>

            <NeuButton
              onClick={toggleFavorite}
              className={`p-3 bg-white bg-opacity-90 ${isFavorite ? 'bg-red-50' : ''}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
            </NeuButton>
          </div>
        </div>

        {/* Store Logo and Info - Positioned like Android */}
        <div className="absolute bottom-8 left-5 right-5">
          <div className="flex items-center space-x-4">
            {/* Store Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-lg">
              {shop.logoUrl && !shop.logoUrl.startsWith('content://') ? (
                <img
                  src={shop.logoUrl}
                  alt={`${shop.name} logo`}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg ${shop.logoUrl && !shop.logoUrl.startsWith('content://') ? 'hidden' : ''}`}>
                {shop.name.charAt(0)}
              </div>
            </div>

            {/* Store Name and Rating */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1 text-white drop-shadow-lg">{shop.name}</h1>
              <div className="flex items-center space-x-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-white font-medium drop-shadow">
                  {shop.rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Availability Section - Right under banner like Android */}
        <NeuCard className="p-5">
          <h2 className="text-xl font-bold mb-3">Availability</h2>
          <div className="flex flex-wrap gap-2">
            {storeStatus.statusList.map((status, index) => (
              <div
                key={index}
                className={`px-3 py-2 rounded-xl text-sm font-medium ${
                  status.includes('Open Now')
                    ? 'bg-green-500 text-white'
                    : status.includes('Closed')
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {status}
              </div>
            ))}
          </div>
        </NeuCard>

        {/* About Section */}
        <NeuCard className="p-5">
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="text-gray-700 leading-relaxed">{shop.description}</p>
        </NeuCard>

        {/* Store Management Section - Only visible to store owners */}
        {user && shop.ownerId === user.id && (
          <NeuCard className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <h2 className="text-xl font-bold mb-4 text-purple-800">Store Management</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* Booking Management */}
              <Link href={`/store/${storeId}/booking-management`}>
                <NeuButton className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-purple-50 border border-purple-200">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Booking Management</span>
                </NeuButton>
              </Link>

              {/* Order Management */}
              <Link href={`/store/${storeId}/order-management`}>
                <NeuButton className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-white hover:bg-blue-50 border border-blue-200">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Order Management</span>
                </NeuButton>
              </Link>
            </div>
          </NeuCard>
        )}

        {/* Products & Services - Matches Android layout */}
        <NeuCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Products & Services</h2>
          {(productsLoading || servicesLoading) ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading catalog...</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Products */}
              {products.length > 0 && products.map((item) => (
                <Link
                  key={`product-${item.id}`}
                  href={`/item/${item.id}`}
                  className="block"
                >
                  <NeuCard className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                        {getProductImageUrl(item) ? (
                          <img
                            src={getProductImageUrl(item)!}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onLoad={() => {
                              console.log('✅ Product image loaded successfully:', getProductImageUrl(item));
                            }}
                            onError={(e) => {
                              console.log('❌ Product image failed to load:', getProductImageUrl(item));
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold ${getProductImageUrl(item) ? 'hidden' : ''}`}>
                          {item.name.charAt(0)}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{item.name}</h3>
                        
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">
                            {item.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-blue-600">
                            R{item.price}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Product
                          </span>
                        </div>
                      </div>
                    </div>
                  </NeuCard>
                </Link>
              ))}

              {/* Services */}
              {services.length > 0 && services.map((item) => (
                <Link
                  key={`service-${item.id}`}
                  href={`/service/${item.id}`}
                  className="block"
                >
                  <NeuCard className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center space-x-4">
                      {/* Service Image */}
                      <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                        {getServiceImageUrl(item) ? (
                          <img
                            src={getServiceImageUrl(item)!}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onLoad={() => {
                              console.log('✅ Service image loaded successfully:', getServiceImageUrl(item));
                            }}
                            onError={(e) => {
                              console.log('❌ Service image failed to load:', getServiceImageUrl(item));
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold ${getServiceImageUrl(item) ? 'hidden' : ''}`}>
                          {item.name.charAt(0)}
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{item.name}</h3>
                        
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">
                            {item.rating?.toFixed(1) || '0.0'}
                          </span>
                        </div>

                        {item.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-bold text-purple-600">
                            R{item.basePrice}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Service
                          </span>
                        </div>
                      </div>
                    </div>
                  </NeuCard>
                </Link>
              ))}

              {/* No items message */}
              {products.length === 0 && services.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No products or services available</p>
                </div>
              )}
            </div>
          )}
        </NeuCard>

        {/* Contact Details - Last section like Android */}
        <NeuCard className="p-5">
          <h2 className="text-xl font-bold mb-4">Contact Details</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">
                {shop.address || shop.location || '123 Business Street, City'}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <button
                onClick={handleCall}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {shop.phone || '+1 (555) 123-4567'}
              </button>
            </div>
          </div>
        </NeuCard>

        {/* Reviews Section - Placeholder for now */}
        <NeuCard className="p-6">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Reviews system coming soon...</p>
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-bold text-lg">{shop.rating.toFixed(1)}</span>
                <span className="text-gray-500">({shop.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </NeuCard>

        {/* Bottom Spacing */}
        <div className="h-6"></div>
      </div>
    </div>
  );
}
