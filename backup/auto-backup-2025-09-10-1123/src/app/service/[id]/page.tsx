'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Share, 
  Heart, 
  Star, 
  Calendar,
  Plus,
  Minus,
  User,
  CheckCircle,
  DollarSign,
  Clock
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { serviceRepository } from '@/lib/firebase/repositories';
import { Service } from '@/types/models';

interface ServicePageProps {
  params: Promise<{ id: string }>;
}

export default function ServicePage({ params }: ServicePageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Service state
  const [serviceId, setServiceId] = useState<string>('');
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => setServiceId(id));
  }, [params]);

  // Load service data
  useEffect(() => {
    if (!serviceId) return;
    
    const loadService = async () => {
      try {
        setLoading(true);
        setError(null);
        const serviceData = await serviceRepository.getServiceById(serviceId);
        if (serviceData) {
          setService(serviceData);
          setIsFavorite(false); // TODO: Implement favorite functionality
        } else {
          setError('Service not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  // Get service image URL with fallbacks
  const getServiceImageUrl = (service: Service, index: number = 0) => {
    if (service.imageUrls && service.imageUrls.length > index) {
      return service.imageUrls[index];
    }
    if (service.primaryImageUrl) {
      return service.primaryImageUrl;
    }
    return null;
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!service) return 0;
    return service.basePrice * quantity;
  }, [service, quantity]);

  // Handle booking request
  const handleBookNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!service) return;

    setIsBooking(true);
    try {
      // TODO: Implement booking functionality
      // For now, navigate to booking screen
      router.push(`/booking/${service.id}?quantity=${quantity}`);
    } catch (err) {
      console.error('Error requesting booking:', err);
    } finally {
      setIsBooking(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share && service) {
      try {
        await navigator.share({
          title: service.name,
          text: service.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // Loading state
  if (!serviceId || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Service not found'}</p>
          <NeuButton onClick={() => router.back()}>
            Go Back
          </NeuButton>
        </div>
      </div>
    );
  }

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

          <NeuButton
            onClick={handleShare}
            className="p-3"
          >
            <Share className="h-5 w-5" />
          </NeuButton>
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
            <User className="h-5 w-5 text-blue-600 mr-2" />
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
        <NeuCard className="p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quantity</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Number of bookings:</span>
            
            <div className="flex items-center space-x-4">
              <NeuButton
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </NeuButton>
              
              <span className="text-2xl font-bold min-w-8 text-center">{quantity}</span>
              
              <NeuButton
                onClick={() => setQuantity(quantity + 1)}
                className="p-2"
              >
                <Plus className="h-4 w-4" />
              </NeuButton>
            </div>
          </div>
        </NeuCard>

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
