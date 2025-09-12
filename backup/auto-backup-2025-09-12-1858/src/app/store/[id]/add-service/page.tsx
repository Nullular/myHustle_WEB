'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Camera,
  Plus,
  Clock,
  DollarSign,
  Tag,
  Users,
  Calendar,
  Settings
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import SimpleCropUpload from '@/components/ui/SimpleCropUploadWrapper';
import { useAuthStore } from '@/lib/store/auth';
import { serviceRepository } from '@/lib/firebase/repositories';
import { Service } from '@/types/models';

interface AddServicePageProps {
  params: Promise<{ id: string }>;
}

export default function AddServicePage({ params }: AddServicePageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState<string>('');
  
  // Form state
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Beauty & Wellness');
  const [isAvailable, setIsAvailable] = useState(true);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState('10');
  const [advanceBookingDays, setAdvanceBookingDays] = useState('30');
  const [expensePerUnit, setExpensePerUnit] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const serviceCategories = [
    'Beauty & Wellness', 'Health & Fitness', 'Home Services', 
    'Professional Services', 'Automotive', 'Education & Training',
    'Photography', 'Event Planning', 'Repair Services', 'Other'
  ];

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => setStoreId(id));
  }, [params]);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const isFormValid = () => {
    return serviceName.trim() !== '' && 
           basePrice.trim() !== '' && 
           duration.trim() !== '' &&
           !isNaN(Number(basePrice)) &&
           Number(basePrice) > 0;
  };

  const handleSaveService = async () => {
    if (!isFormValid() || !user || !storeId) return;

    setIsLoading(true);
    try {
      const serviceData: Omit<Service, 'id'> = {
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        basePrice: Number(basePrice),
        primaryImageUrl: selectedImages[0] || '',
        imageUrls: selectedImages,
        currency: 'USD',
        category: selectedCategory,
        estimatedDuration: Number(duration) || 60,
        isBookable: true,
        expensePerUnit: 0,
        rating: 0,
        totalReviews: 0,
        shopId: storeId,
        ownerId: user.id,
        active: true,
        isFeatured: false,
        tags: [],
        requirements: [],
        includes: [],
        availability: {
          daysAvailable: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          startTime: '09:00',
          endTime: '17:00',
          timeSlotDuration: Number(duration) || 60,
          advanceBookingDays: Number(advanceBookingDays) || 30,
          cancellationPolicy: 'Standard'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const serviceId = await serviceRepository.addService(serviceData);
      
      if (serviceId) {
        console.log('✅ Service created successfully:', serviceId);
        router.push(`/store/${storeId}/manage`);
      } else {
        throw new Error('Failed to create service');
      }
    } catch (error) {
      console.error('❌ Error creating service:', error);
      alert('Failed to create service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardService = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NeuButton
                variant="default"
                onClick={handleDiscardService}
              >
                <ArrowLeft size={20} />
              </NeuButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Add New Service</h1>
                <p className="text-gray-600 text-sm">
                  Create a new service for your business
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          {/* Service Images Section */}
          <SimpleCropUpload
            images={selectedImages}
            onImagesChange={setSelectedImages}
            maxImages={4}
            uploadPath={`services/${storeId}`}
            usage="service"
            title="Service Images"
            subtitle="Add up to 4 photos. First photo will be the main service image."
          />

          {/* Basic Information */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter service name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe your service..."
                />
              </div>
            </div>
          </NeuCard>

          {/* Pricing & Duration */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing & Duration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1 hour, 30 minutes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Per Service
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={expensePerUnit}
                    onChange={(e) => setExpensePerUnit(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    {serviceCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Booking Settings */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                  Service is available for booking
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Bookings Per Day
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      value={maxBookingsPerDay}
                      onChange={(e) => setMaxBookingsPerDay(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advance Booking (Days)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      value={advanceBookingDays}
                      onChange={(e) => setAdvanceBookingDays(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Settings className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Booking Settings Info</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Max bookings controls how many appointments you can handle per day. 
                      Advance booking days determines how far in advance customers can book.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Bottom Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex space-x-4">
            <NeuButton
              variant="default"
              onClick={handleDiscardService}
              className="flex-1"
              disabled={isLoading}
            >
              Discard
            </NeuButton>
            
            <NeuButton
              onClick={handleSaveService}
              className="flex-1"
              disabled={!isFormValid() || isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Service'}
            </NeuButton>
          </div>

          {/* Bottom Spacing */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
}

// Service Image Section Component
function ServiceImageSection({ 
  selectedImages, 
  onImagesChange 
}: { 
  selectedImages: string[]; 
  onImagesChange: (images: string[]) => void;
}) {
  const handleImageUpload = () => {
    // TODO: Implement image picker/upload
    console.log('Open image picker');
  };

  return (
    <NeuCard className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Service Images</h2>
      
      <div className="flex space-x-4 overflow-x-auto">
        {/* Main image placeholder */}
        <div
          onClick={handleImageUpload}
          className="w-32 h-32 border-2 border-dashed border-purple-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-colors bg-purple-50"
        >
          <Camera className="h-8 w-8 text-purple-500 mb-2" />
          <span className="text-sm text-purple-600 font-medium">Add Photo</span>
        </div>
        
        {/* Additional image slots */}
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            onClick={handleImageUpload}
            className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
        ))}
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Add up to 4 photos of your service. Include before/after photos or service setup.
      </p>
    </NeuCard>
  );
}
