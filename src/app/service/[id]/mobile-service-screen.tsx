'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Share, 
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

import { NeuButton, NeuCard } from '@/components/ui';
import { Service, User } from '@/types/models';

export interface MobileServiceScreenProps {
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

export function MobileServiceScreen({
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
}: MobileServiceScreenProps) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-2 py-2">
        <div className="flex justify-between items-center">
          <NeuButton onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </NeuButton>
          <h1 className="text-md font-semibold text-gray-800 truncate mx-2">
            Service Details
          </h1>
          <NeuButton onClick={handleShare} className="p-2">
            <Share className="h-5 w-5" />
          </NeuButton>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-60">
        {getServiceImageUrl(service) ? (
          <img
            src={getServiceImageUrl(service)!}
            alt={service.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-3xl font-bold">
            {service.name.charAt(0)}
          </div>
        )}
        <NeuButton
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 right-3 p-2 rounded-full ${isFavorite ? 'bg-red-100' : 'bg-white/80'}`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
        </NeuButton>
      </div>

      <div className="p-4 pb-32">
        {/* Title and Rating */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-bold">{service.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500 text-sm">({service.totalReviews} reviews)</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 p-3 rounded-lg text-center">
            <DollarSign className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-bold text-gray-800">R{service.basePrice.toFixed(2)}</p>
          </div>
          <div className="bg-gray-100 p-3 rounded-lg text-center">
            <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-bold text-gray-800">{service.estimatedDuration} min</p>
          </div>
        </div>

        {/* Quantity */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity</h3>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
            <span className="text-gray-700">Number of bookings</span>
            <div className="flex items-center space-x-3">
              <NeuButton
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </NeuButton>
              <span className="text-xl font-bold">{quantity}</span>
              <NeuButton
                onClick={() => setQuantity(quantity + 1)}
                className="p-2"
              >
                <Plus className="h-4 w-4" />
              </NeuButton>
            </div>
          </div>
        </div>
        
        {/* Features */}
        {service.tags && service.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Features</h3>
            <div className="space-y-2">
              {service.tags.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-blue-600">R{totalPrice.toFixed(2)}</p>
          </div>
          <NeuButton
            onClick={handleBookNow}
            disabled={isBooking}
            className="w-1/2 h-12 text-md font-bold"
          >
            <div className="flex items-center justify-center space-x-2">
              {isBooking ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              ) : (
                <Calendar className="h-5 w-5" />
              )}
              <span>
                {isBooking ? 'Processing...' : 'Book Now'}
              </span>
            </div>
          </NeuButton>
        </div>
      </div>
    </div>
  );
}
