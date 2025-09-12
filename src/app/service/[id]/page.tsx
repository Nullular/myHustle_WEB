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
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopServiceScreen } from './desktop-service-screen';
import { MobileServiceScreen } from './mobile-service-screen';

interface ServicePageProps {
  params: Promise<{ id: string }>;
}

export default function ServicePage({ params }: ServicePageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isMobile } = useResponsive();
  
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

  const screenProps = {
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
  };

  return isMobile ? <MobileServiceScreen {...screenProps} /> : <DesktopServiceScreen {...screenProps} />;
}
