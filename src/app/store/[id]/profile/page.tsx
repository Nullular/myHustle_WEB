'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Store,
  Save,
  Camera
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import SimpleCropUpload from '@/components/ui/SimpleCropUploadWrapper';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { shopRepository } from '@/lib/firebase/repositories';
import { Shop } from '@/types/models';
import { BUSINESS_CATEGORIES } from '@/lib/data/categories';

export default function StoreProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  const { shop, loading, error } = useShop(storeId);
  
  // Form state
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof BUSINESS_CATEGORIES)[number]>(BUSINESS_CATEGORIES[0]);
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('17:00');
  const [operatingDays, setOperatingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  
  // Images - separated into logo, banner, and gallery
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Check if user is the owner of this store
  const isOwner = user && shop && user.id === shop.ownerId;

  // Load existing shop data when component mounts
  useEffect(() => {
    if (shop && isOwner) {
      setStoreName(shop.name);
      setDescription(shop.description);
      // Ensure category is one of BUSINESS_CATEGORIES
      const validCategory = (BUSINESS_CATEGORIES as readonly string[]).includes(shop.category)
        ? (shop.category as (typeof BUSINESS_CATEGORIES)[number])
        : BUSINESS_CATEGORIES[0];
      setSelectedCategory(validCategory);
      setLocation(shop.location);
      setAddress(shop.address);
      setPhoneNumber(shop.phone);
      setEmail(shop.email);
      setWebsite(shop.website);
      setOpenTime(shop.openTime24);
      setCloseTime(shop.closeTime24);
      
      // Set existing images
      if (shop.logoUrl) setLogoImages([shop.logoUrl]);
      if (shop.bannerUrl) setBannerImages([shop.bannerUrl]);
      
      // Set gallery images from existing structure
      const gallery = [];
      if (shop.imageUrl) gallery.push(shop.imageUrl);
      if (shop.coverImageUrl) gallery.push(shop.coverImageUrl);
      setGalleryImages(gallery);
      
      // Parse address for city/state if needed
      const addressParts = shop.address.split(',');
      if (addressParts.length >= 2) {
        setAddress(addressParts[0].trim());
        const cityState = addressParts[1].trim();
        const cityStateParts = cityState.split(' ');
        if (cityStateParts.length >= 2) {
          setCity(cityStateParts.slice(0, -1).join(' '));
          setState(cityStateParts[cityStateParts.length - 1]);
        } else {
          setCity(cityState);
        }
      }
    }
  }, [shop, isOwner]);

  const isFormValid = () => {
    const basicValid = storeName.trim() !== '' &&
           description.trim() !== '' &&
           location.trim() !== '' &&
           address.trim() !== '' &&
           city.trim() !== '' &&
           state.trim() !== '' &&
           phoneNumber.trim() !== '';

    const categoryValid = BUSINESS_CATEGORIES.includes(selectedCategory);
    const hasLogo = (logoImages[0] || '').trim() !== '';
    const hasBanner = (bannerImages[0] || '').trim() !== '';

    return basicValid && categoryValid && hasLogo && hasBanner;
  };

  const handleDayToggle = (day: string) => {
    setOperatingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleUpdateStore = async () => {
    console.log('🏪 Starting store update...');
    console.log('📝 Form validation:', isFormValid());
    console.log('👤 Current user:', user?.email);
    
    if (!user || !shop) {
      console.log('❌ No user, or no shop');
      return;
    }

    // Validate required fields with explicit messaging
    const errors: string[] = [];
    if (!BUSINESS_CATEGORIES.includes(selectedCategory)) errors.push('Please select a valid category.');
    if (!(logoImages[0] || '').trim()) errors.push('Please upload a store logo.');
    if (!(bannerImages[0] || '').trim()) errors.push('Please upload a store banner.');
    if (!isFormValid()) {
      // If basic fields are missing, rely on disabled button plus generic message
      if (errors.length === 0) errors.push('Please complete all required fields.');
    }
    if (errors.length > 0) {
      setValidationError(errors.join(' '));
      setTimeout(() => setValidationError(null), 4000);
      console.log('❌ Validation errors:', errors);
      return;
    }

    setIsSaving(true);

    try {
      // Create operating hours object
      const operatingHours: Record<string, string> = {};
      daysOfWeek.forEach(day => {
        if (operatingDays.includes(day)) {
          operatingHours[day] = `${openTime} - ${closeTime}`;
        }
      });

      // Update shop data
      const updatedShop: Shop = {
        ...shop,
        name: storeName,
        description: description,
        category: selectedCategory,
        location: location,
        address: `${address}, ${city}, ${state}`,
        phone: phoneNumber,
        email: email,
        website: website,
        logoUrl: logoImages[0] || '',
        bannerUrl: bannerImages[0] || '',
        imageUrl: galleryImages[0] || '',
        coverImageUrl: galleryImages[1] || '',
        openTime24: openTime,
        closeTime24: closeTime,
        operatingHours: operatingHours,
        updated_at: new Date(),
      };

      console.log('🔄 Updating shop with data:', updatedShop);

      const success = await shopRepository.updateShop(updatedShop);

      if (success) {
        console.log('✅ Shop updated successfully');
        
        // Navigate back to store management
        setTimeout(() => {
          console.log('🔄 Navigating back to store management...');
          router.push(`/store/${storeId}/manage`);
        }, 1000);
      } else {
        throw new Error('Failed to update shop');
      }
    } catch (error) {
      console.error('❌ Error updating shop:', error);
      alert('Failed to update store. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading store: {error || 'Store not found'}</p>
          <NeuButton onClick={() => router.back()}>
            Go Back
          </NeuButton>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">You don't have permission to edit this store</p>
          <NeuButton onClick={() => router.back()}>
            Go Back
          </NeuButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NeuButton
                variant="default"
                onClick={() => router.back()}
              >
                <ArrowLeft size={20} />
              </NeuButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Edit Store Profile</h1>
                <p className="text-gray-600 text-sm">
                  Update your store information and images
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="px-4 py-6 space-y-6">
          {/* Store Logo */}
          <NeuCard className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Store Logo</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload your store logo. This will appear as your profile picture.
                </p>
              </div>
              <SimpleCropUpload
                images={logoImages}
                onImagesChange={setLogoImages}
                maxImages={1}
                uploadPath={`shops/${storeId}/logo`}
                usage="store-logo"
                title=""
                subtitle=""
              />
            </div>
          </NeuCard>

          {/* Store Banner */}
          <NeuCard className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Store Banner</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload a banner image for your store header. Recommended size: 1200x400px.
                </p>
              </div>
              <SimpleCropUpload
                images={bannerImages}
                onImagesChange={setBannerImages}
                maxImages={1}
                uploadPath={`shops/${storeId}/banner`}
                usage="store-banner"
                title=""
                subtitle=""
              />
            </div>
          </NeuCard>

          {/* Store Gallery */}
          <NeuCard className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Store Gallery</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload up to 4 photos showcasing your store, products, or services.
                </p>
              </div>
              <SimpleCropUpload
                images={galleryImages}
                onImagesChange={setGalleryImages}
                maxImages={4}
                uploadPath={`shops/gallery/${storeId}`}
                usage="store-logo"
                title=""
                subtitle=""
              />
            </div>
          </NeuCard>

          {/* Basic Information */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your store..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as (typeof BUSINESS_CATEGORIES)[number])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select store category"
                >
                  {BUSINESS_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </NeuCard>

          {/* Contact Information */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="store@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.yourstore.com"
                />
              </div>
            </div>
          </NeuCard>

          {/* Location Information */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  General Location *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Downtown District, Shopping Mall, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State/Province"
                  />
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Operating Hours */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Operating Hours</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select opening time"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Select closing time"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Operating Days
                </label>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                  {daysOfWeek.map(day => (
                    <label key={day} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={operatingDays.includes(day)}
                        onChange={() => handleDayToggle(day)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        title={`Toggle ${day}`}
                        aria-label={`Toggle ${day}`}
                      />
                      <span className="text-sm text-gray-700">{day.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Validation error */}
          {validationError && (
            <div className="px-4">
              <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg p-3">
                {validationError}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <NeuButton
              variant="default"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </NeuButton>
            
            <NeuButton
              onClick={handleUpdateStore}
              disabled={!isFormValid() || isSaving}
              className="min-w-[150px]"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="mr-2" size={16} />
                  Save Changes
                </>
              )}
            </NeuButton>
          </div>
        </div>
      </div>
    </div>
  );
}