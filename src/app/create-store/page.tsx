'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Clock,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Tag,
  Camera
} from 'lucide-react';

import { NeuButton, NeuCard, ImageUpload } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { shopRepository } from '@/lib/firebase/repositories';
import { Shop } from '@/types/models';
import CreateButton from '@/components/ui/CreateButton';

export default function CreateStorePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Form state
  const [storeName, setStoreName] = useState('');
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  
  // Operating hours
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('17:00');
  const [operatingDays, setOperatingDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ]);
  
  // Images - separated into logo, banner, and gallery
  const [logoImages, setLogoImages] = useState<string[]>([]);
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 
    'Beauty', 'Books', 'Toys', 'Food & Beverages', 'Other'
  ];

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  // Check authentication
  useEffect(() => {
    if (!user) {
      console.log('🔐 No user found, redirecting to login...');
      router.push('/login');
    } else {
      console.log('✅ User authenticated:', user.email);
    }
  }, [user, router]);

  const isFormValid = () => {
    return shopName.trim() !== '' && 
           description.trim() !== '' &&
           address.trim() !== '' &&
           city.trim() !== '' &&
           state.trim() !== '' &&
           phoneNumber.trim() !== '';
  };

  const handleDayToggle = (day: string) => {
    setOperatingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleCreateStore = async () => {
    console.log('🏪 Starting store creation...');
    console.log('📝 Form validation:', isFormValid());
    console.log('👤 Current user:', user?.email);
    
    if (!isFormValid() || !user) {
      console.log('❌ Form invalid or no user');
      return;
    }

    setIsLoading(true);
    try {
      const shopData: Omit<Shop, 'id'> = {
        name: shopName.trim(),
        description: description.trim(),
        category: selectedCategory,
        ownerId: user.id,
        
        // Location and contact
        location: `${city.trim()}, ${state.trim()}`,
        address: address.trim(),
        phone: phoneNumber.trim(),
        email: email.trim() || user.email || '',
        website: website.trim(),
        
        // Images
        imageUrl: galleryImages[0] || '',
        coverImageUrl: galleryImages[1] || '',
        logoUrl: logoImages[0] || '',
        bannerUrl: bannerImages[0] || '',
        
        // Operating hours - using the existing model structure
        openTime24: openTime,
        closeTime24: closeTime,
        operatingHours: {
          monday: operatingDays.includes('Monday') ? `${openTime}-${closeTime}` : 'Closed',
          tuesday: operatingDays.includes('Tuesday') ? `${openTime}-${closeTime}` : 'Closed',
          wednesday: operatingDays.includes('Wednesday') ? `${openTime}-${closeTime}` : 'Closed',
          thursday: operatingDays.includes('Thursday') ? `${openTime}-${closeTime}` : 'Closed',
          friday: operatingDays.includes('Friday') ? `${openTime}-${closeTime}` : 'Closed',
          saturday: operatingDays.includes('Saturday') ? `${openTime}-${closeTime}` : 'Closed',
          sunday: operatingDays.includes('Sunday') ? `${openTime}-${closeTime}` : 'Closed',
        },
        
        // Social media
        socialMedia: {
          instagram: instagram.trim(),
          facebook: facebook.trim(),
          twitter: twitter.trim()
        },
        
        // Default values matching the model
        rating: 0,
        totalReviews: 0,
        isVerified: false,
        isPremium: false,
        active: true,
        availability: 'Open',
        responseTime: '1 hour',
        tags: [],
        specialties: [],
        priceRange: '$$',
        deliveryOptions: [],
        paymentMethods: ['Cash', 'Card'],
        catalog: [],
        
        // Timestamps
        created_at: new Date(),
        updated_at: new Date(),
        isFavorite: false
      };

      console.log('📝 Creating shop with data:', shopData);
      
      const newShopId = await shopRepository.addShop(shopData);
      
      if (newShopId) {
        console.log('✅ Shop created successfully with ID:', newShopId);
        
        // Add debugging to track navigation
        console.log('🚀 About to navigate to /my-stores');
        console.log('📍 Current pathname:', window.location.pathname);
        
        // Add a small delay to ensure the shop is properly saved
        setTimeout(() => {
          console.log('🔄 Navigating to my-stores...');
          console.log('🔄 Router object:', router);
          
          router.push('/my-stores');
          
          // Additional debug
          setTimeout(() => {
            console.log('📍 After navigation pathname:', window.location.pathname);
          }, 500);
        }, 1000);
      } else {
        throw new Error('Failed to create shop - no ID returned');
      }
      
    } catch (error) {
      console.error('❌ Error creating shop:', error);
      alert('Failed to create store. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NeuButton
                variant="default"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                <ArrowLeft size={20} />
              </NeuButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Create Your Store</h1>
                <p className="text-gray-600 text-sm">
                  Set up your business profile on MyHustle
                </p>
              </div>
            </div>
          </div>
        </header>

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
              <ImageUpload
                images={logoImages}
                onImagesChange={setLogoImages}
                maxImages={1}
                uploadPath={`shops/temp-${Date.now()}/logo`}
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
              <ImageUpload
                images={bannerImages}
                onImagesChange={setBannerImages}
                maxImages={1}
                uploadPath={`shops/banners/${Date.now()}`}
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
              <ImageUpload
                images={galleryImages}
                onImagesChange={setGalleryImages}
                maxImages={4}
                uploadPath={`shops/gallery/${Date.now()}`}
                title=""
                subtitle=""
              />
            </div>
          </NeuCard>

          {/* Basic Information */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Store className="mr-2 text-blue-500" size={24} />
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Tell customers about your store..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    title="Select store category"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Location Information */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <MapPin className="mr-2 text-blue-500" size={24} />
              Location
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Contact Information */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Phone className="mr-2 text-blue-500" size={24} />
              Contact Information
            </h2>
            
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="store@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-gray-700">Social Media (Optional)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="@username"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Facebook page"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </NeuCard>

          {/* Operating Hours */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Clock className="mr-2 text-blue-500" size={24} />
              Operating Hours
            </h2>
            
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Opening time"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    title="Closing time"
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

          {/* Create Store Button */}
          <div className="flex justify-end space-x-4 pt-6">
            <NeuButton
              variant="default"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </NeuButton>
            
            <CreateButton
              onClick={handleCreateStore}
              disabled={!isFormValid() || isLoading}
              text={isLoading ? 'Creating...' : 'Create Store'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}