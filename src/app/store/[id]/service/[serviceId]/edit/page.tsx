'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Save,
  Briefcase,
  Trash2,
  Plus,
  X,
  Clock
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import SimpleCropUpload from '@/components/ui/SimpleCropUploadWrapper';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { serviceRepository } from '@/lib/firebase/repositories';
import { Service } from '@/types/models';
import { SERVICE_CATEGORIES } from '@/lib/data/categories';

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  const serviceId = params.serviceId as string;
  const { shop, loading: shopLoading } = useShop(storeId);
  
  // Form state
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('Consultation');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [active, setActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBookable, setIsBookable] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  
  // Images
  const [serviceImages, setServiceImages] = useState<string[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<Service | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newInclude, setNewInclude] = useState('');

  const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  // Check if user is the owner of this store
  const isOwner = user && shop && user.id === shop.ownerId;

  // Load existing service data
  useEffect(() => {
    const loadService = async () => {
      if (!serviceId) return;
      
      try {
        console.log('🔍 Loading service:', serviceId);
        const serviceData = await serviceRepository.getServiceById(serviceId);
        
        if (serviceData && isOwner) {
          console.log('🛠️ Service loaded:', serviceData);
          setService(serviceData);
          setServiceName(serviceData.name);
          setDescription(serviceData.description);
          setBasePrice(serviceData.basePrice.toString());
          setCurrency(serviceData.currency);
          setCategory(serviceData.category);
          setEstimatedDuration(serviceData.estimatedDuration.toString());
          setActive(serviceData.active);
          setIsFeatured(serviceData.isFeatured);
          setIsBookable(serviceData.isBookable);
          setTags(serviceData.tags || []);
          setRequirements(serviceData.requirements || []);
          setIncludes(serviceData.includes || []);
          setServiceImages(serviceData.imageUrls || []);
        }
      } catch (error) {
        console.error('❌ Error loading service:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOwner) {
      loadService();
    } else {
      setIsLoading(false);
    }
  }, [serviceId, isOwner]);

  const isFormValid = () => {
    return serviceName.trim() !== '' &&
           description.trim() !== '' &&
           basePrice.trim() !== '' &&
           !isNaN(Number(basePrice)) &&
           Number(basePrice) > 0 &&
           estimatedDuration.trim() !== '' &&
           !isNaN(Number(estimatedDuration)) &&
           Number(estimatedDuration) > 0;
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      setRequirements([...requirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (reqToRemove: string) => {
    setRequirements(requirements.filter(req => req !== reqToRemove));
  };

  const handleAddInclude = () => {
    if (newInclude.trim() && !includes.includes(newInclude.trim())) {
      setIncludes([...includes, newInclude.trim()]);
      setNewInclude('');
    }
  };

  const handleRemoveInclude = (itemToRemove: string) => {
    setIncludes(includes.filter((item: string) => item !== itemToRemove));
  };

  const handleSaveService = async () => {
    console.log('💾 Starting service update...');
    console.log('📝 Form validation:', isFormValid());
    
    if (!isFormValid() || !user || !service) {
      console.log('❌ Form invalid, no user, or no service');
      return;
    }

    setIsSaving(true);

    try {
      const updatedService: Service = {
        ...service,
        name: serviceName,
        description: description,
        basePrice: Number(basePrice),
        currency: currency,
        category: category,
        estimatedDuration: Number(estimatedDuration),
        active: active,
        isFeatured: isFeatured,
        isBookable: isBookable,
        tags: tags,
        requirements: requirements,
        includes: includes,
        imageUrls: serviceImages,
        primaryImageUrl: serviceImages[0] || '',
        updatedAt: Date.now(),
      };

      console.log('🔄 Updating service with data:', updatedService);

      const success = await serviceRepository.updateService(updatedService);

      if (success) {
        console.log('✅ Service updated successfully');
        
        // Navigate back to catalog management
        setTimeout(() => {
          console.log('🔄 Navigating back to catalog...');
          router.push(`/store/${storeId}/catalog`);
        }, 1000);
      } else {
        throw new Error('Failed to update service');
      }
    } catch (error) {
      console.error('❌ Error updating service:', error);
      alert('Failed to update service. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async () => {
    if (!service) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${service.name}"? This action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        console.log('🗑️ Deleting service:', service.id);
        const success = await serviceRepository.deleteService(service.id);
        
        if (success) {
          console.log('✅ Service deleted successfully');
          router.push(`/store/${storeId}/catalog`);
        } else {
          throw new Error('Failed to delete service');
        }
      } catch (error) {
        console.error('❌ Error deleting service:', error);
        alert('Failed to delete service. Please try again.');
      }
    }
  };

  if (shopLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service...</p>
        </div>
      </div>
    );
  }

  if (!shop || !isOwner || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {!shop ? 'Store not found' : 
             !isOwner ? 'You don\'t have permission to edit this service' :
             'Service not found'}
          </p>
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
                <h1 className="text-2xl font-bold text-gray-800">Edit Service</h1>
                <p className="text-gray-600 text-sm">
                  Update "{service.name}" details
                </p>
              </div>
            </div>
            
            {/* Delete Button */}
            <NeuButton
              onClick={handleDeleteService}
              variant="default"
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 size={20} />
            </NeuButton>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="px-4 py-6 space-y-6">
          {/* Service Images */}
          <NeuCard className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Service Images</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upload up to 6 images showcasing your service. The first image will be used as the primary image.
                </p>
              </div>
              <SimpleCropUpload
                images={serviceImages}
                onImagesChange={setServiceImages}
                maxImages={6}
                uploadPath={`services/${serviceId}`}
                usage="service"
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
                  Service Name *
                </label>
                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter service name"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your service in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Select service category"
                >
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </NeuCard>

          {/* Pricing & Duration */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing & Duration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="flex">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      title="Select currency"
                    >
                      {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      step="0.01"
                      min="0"
                      className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="60"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isBookable}
                    onChange={(e) => setIsBookable(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Bookable</span>
                </label>
              </div>
            </div>
          </NeuCard>

          {/* Tags */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a tag (e.g., professional, certified, mobile)"
                />
                <NeuButton onClick={handleAddTag}>
                  <Plus size={16} />
                </NeuButton>
              </div>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                        title={`Remove ${tag} tag`}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </NeuCard>

          {/* Requirements */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements</h3>
            <p className="text-gray-600 text-sm mb-4">
              What do customers need to provide or prepare for this service?
            </p>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a requirement (e.g., Provide device model, Clear workspace)"
                />
                <NeuButton onClick={handleAddRequirement}>
                  <Plus size={16} />
                </NeuButton>
              </div>
              
              {requirements.length > 0 && (
                <div className="space-y-2">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-gray-800">{req}</span>
                      <button
                        onClick={() => handleRemoveRequirement(req)}
                        className="text-red-600 hover:text-red-800"
                        title={`Remove requirement: ${req}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </NeuCard>

          {/* What's Included */}
          <NeuCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Included</h3>
            <p className="text-gray-600 text-sm mb-4">
              What does this service include? What will the customer receive?
            </p>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInclude()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add included item (e.g., Free consultation, 1-year warranty)"
                />
                <NeuButton onClick={handleAddInclude}>
                  <Plus size={16} />
                </NeuButton>
              </div>
              
              {includes.length > 0 && (
                <div className="space-y-2">
                  {includes.map((item: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-800">{item}</span>
                      <button
                        onClick={() => handleRemoveInclude(item)}
                        className="text-red-600 hover:text-red-800"
                        title={`Remove included item: ${item}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </NeuCard>

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
              onClick={handleSaveService}
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