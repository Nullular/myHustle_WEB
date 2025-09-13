'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  Calendar,
  Plus,
  Minus,
  User as UserIcon,
  CheckCircle,
  DollarSign,
  Clock
} from 'lucide-react';
import ShareButton from '@/components/ui/ShareButton';

import { NeuButton, NeuCard } from '@/components/ui';
import { Service, User } from '@/types/models';

export interface DesktopServiceScreenProps {
  service: Service;
  user: User | null;
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  totalPrice: number;
  handleBookNow: () => void;
  isBooking: boolean;
  handleShare: () => void;
}

export function DesktopServiceScreen({
  service,
  user,
  isFavorite,
  setIsFavorite,
  quantity,
  setQuantity,
  totalPrice,
  handleBookNow,
  isBooking,
  handleShare,
}: DesktopServiceScreenProps) {
  const router = useRouter();

  const getServiceImageUrl = (service: Service, index: number = 0) => {
    if (service.imageUrls && service.imageUrls.length > index) {
      return service.imageUrls[index];
    }
    if (service.primaryImageUrl) {
      return service.primaryImageUrl;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <NeuButton
            onClick={() => router.back()}
            className="p-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </NeuButton>
          
          <h1 className="text-lg font-bold text-gray-800 truncate mx-4">
            Service Details
          </h1>

          <ShareButton onClick={handleShare} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-24">
        {/* Hero Image Section */}
        <div className="relative h-80 mt-6 mb-6">
          <NeuCard className="h-full overflow-hidden">
            {getServiceImageUrl(service) ? (
              <>
                <img
                  src={getServiceImageUrl(service)!}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {service.name.charAt(0)}
              </div>
            )}
            
            {/* Favorite Button */}
            <NeuButton
              onClick={() => setIsFavorite(!isFavorite)}
              className={`absolute top-4 right-4 p-3 ${isFavorite ? 'bg-red-50' : 'bg-white bg-opacity-90'}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
            </NeuButton>

            {/* Availability Badge */}
            <div className="absolute top-4 left-4">
              <div className="bg-green-500 bg-opacity-90 text-white px-3 py-1 rounded-full text-sm font-medium">
                Available
              </div>
            </div>

            {/* Rating Badge */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-full flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{service.rating.toFixed(1)}</span>
                <span className="text-white/80 text-sm">({service.totalReviews})</span>
              </div>
            </div>
          </NeuCard>
        </div>

        {/* Service Information Card */}
        <NeuCard className="p-6 mb-6">
          {/* Service Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">{service.name}</h1>
          
          {/* Provider Information */}
          <div className="flex items-center mb-4">
            <UserIcon className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-600 font-medium">by Service Provider</span>
          </div>
          
          {/* Service Description */}
          {service.description && (
            <p className="text-gray-700 leading-relaxed mb-6">{service.description}</p>
          )}
          
          {/* Features & Highlights */}
          {service.tags && service.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Features & Highlights</h3>
              <div className="space-y-2">
                {service.tags.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </NeuCard>

        {/* Pricing & Duration Section */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Price Card */}
          <NeuCard className="p-4 text-center">
            <DollarSign className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium mb-1">Price</p>
            <p className="text-lg font-bold text-gray-800">R{service.basePrice.toFixed(2)}</p>
          </NeuCard>

          {/* Duration Card */}
          <NeuCard className="p-4 text-center">
            <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm font-medium mb-1">Duration</p>
            <p className="text-lg font-bold text-gray-800">{service.estimatedDuration} min</p>
          </NeuCard>
        </div>

        {/* Quantity Selection */}
            {/* Quantity selector removed for customer booking */}

        {/* Reviews Section */}
        <NeuCard className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Reviews system coming soon...</p>
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-bold text-lg">{service.rating.toFixed(1)}</span>
                <span className="text-gray-500">({service.totalReviews || 0} reviews)</span>
              </div>
              <p className="text-sm text-gray-400 italic">
                "Excellent service! Professional, timely, and exceeded expectations. Highly recommended!"
              </p>
              <p className="text-xs text-gray-400 mt-2">- Sarah M.</p>
            </div>
          </div>
        </NeuCard>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Total Price Display */}
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 font-medium">Total Price</p>
            <p className="text-2xl font-bold text-blue-600">R{totalPrice.toFixed(2)}</p>
          </div>

          {/* Request Booking Button */}
          <NeuButton
            onClick={handleBookNow}
            disabled={isBooking}
            className={`w-full h-12 text-lg font-bold ${
              isBooking
                ? 'opacity-75'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {isBooking ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              ) : (
                <Calendar className="h-5 w-5" />
              )}
              <span>
                {!user
                  ? 'Login to Book Service'
                  : isBooking
                  ? 'Processing...'
                  : 'Request Booking'
                }
              </span>
            </div>
          </NeuButton>
        </div>
      </div>
    </div>
  );
}
