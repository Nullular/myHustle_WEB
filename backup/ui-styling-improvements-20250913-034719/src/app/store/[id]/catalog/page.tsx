'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Plus,
  Package,
  Briefcase,
  Grid3X3,
  List,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Star
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';
import { useShopProducts, useShopServices } from '@/hooks/useProducts';

export default function CatalogManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  const { shop, loading: shopLoading } = useShop(storeId);
  const { products, loading: productsLoading } = useShopProducts(storeId);
  const { services, loading: servicesLoading } = useShopServices(storeId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Check if user is the owner of this store
  const isOwner = user && shop && user.id === shop.ownerId;

  // Combine products and services into catalog items
  const catalogItems = [
    ...products.map((product: any) => ({ ...product, itemType: 'product' })),
    ...services.map((service: any) => ({ ...service, itemType: 'service' }))
  ];

  // Filter catalog items based on search and category
  const filteredItems = catalogItems.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Electronics', 'Clothing', 'Food', 'Beauty', 'Consultation', 'Repair', 'Other'];

  const handleAddProduct = () => {
    console.log('📦 Navigating to add product page...');
    router.push(`/store/${storeId}/add-product`);
  };

  const handleAddService = () => {
    console.log('🛠️ Navigating to add service page...');
    router.push(`/store/${storeId}/add-service`);
  };

  const handleViewProduct = (productId: string) => {
    console.log('👁️ Viewing product:', productId);
    router.push(`/item/${productId}`);
  };

  const handleEditProduct = (itemId: string, itemType: string) => {
    console.log('✏️ Editing item:', itemId, 'Type:', itemType);
    if (itemType === 'product') {
      router.push(`/store/${storeId}/product/${itemId}/edit`);
    } else if (itemType === 'service') {
      router.push(`/store/${storeId}/service/${itemId}/edit`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    console.log('🗑️ Deleting product:', productId);
    // TODO: Implement delete confirmation and action
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      // Implement deletion logic here
      console.log('Deleting product:', productId);
    }
  };

  if (shopLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!shop || !isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">You don't have permission to manage this catalog</p>
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
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NeuButton
                variant="default"
                onClick={() => router.back()}
              >
                <ArrowLeft size={20} />
              </NeuButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Catalog Management</h1>
                <p className="text-gray-600 text-sm">
                  Manage your products and services for {shop.name}
                </p>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex items-center space-x-3">
              <NeuButton onClick={handleAddService} className="hidden md:flex">
                <Briefcase className="mr-2" size={16} />
                Add Service
              </NeuButton>
              <NeuButton onClick={handleAddProduct}>
                <Package className="mr-2" size={16} />
                Add Product
              </NeuButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <NeuCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-800">{catalogItems.length}</p>
              </div>
              <Package className="text-blue-600" size={24} />
            </div>
          </NeuCard>
          
          <NeuCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Products</p>
                <p className="text-2xl font-bold text-gray-800">
                  {products.length}
                </p>
              </div>
              <Package className="text-green-600" size={24} />
            </div>
          </NeuCard>
          
          <NeuCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Services</p>
                <p className="text-2xl font-bold text-gray-800">
                  {services.length}
                </p>
              </div>
              <Briefcase className="text-blue-600" size={24} />
            </div>
          </NeuCard>
          
          <NeuCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-800">
                  {catalogItems.filter((item: any) => item.active).length}
                </p>
              </div>
              <Star className="text-yellow-600" size={24} />
            </div>
          </NeuCard>
        </div>

        {/* Search and Filters */}
        <NeuCard className="p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products and services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Filter by category"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <NeuButton
                variant={viewMode === 'grid' ? 'hover' : 'default'}
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid3X3 size={20} />
              </NeuButton>
              <NeuButton
                variant={viewMode === 'list' ? 'hover' : 'default'}
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List size={20} />
              </NeuButton>
            </div>
          </div>
        </NeuCard>

        {/* Quick Actions for Mobile */}
        <div className="md:hidden mb-6">
          <NeuCard className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <NeuButton onClick={handleAddProduct} className="flex items-center justify-center">
                <Package className="mr-2" size={16} />
                Add Product
              </NeuButton>
              <NeuButton onClick={handleAddService} className="flex items-center justify-center">
                <Briefcase className="mr-2" size={16} />
                Add Service
              </NeuButton>
            </div>
          </NeuCard>
        </div>

        {/* Products Grid/List */}
        {productsLoading || servicesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading catalog...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <NeuCard className="p-12 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {catalogItems.length === 0 ? 'No items in your catalog yet' : 'No items match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {catalogItems.length === 0 
                ? 'Start by adding your first product or service to showcase your offerings.'
                : 'Try adjusting your search terms or category filter.'
              }
            </p>
            {catalogItems.length === 0 && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <NeuButton onClick={handleAddProduct}>
                  <Package className="mr-2" size={16} />
                  Add Your First Product
                </NeuButton>
                <NeuButton onClick={handleAddService} variant="default">
                  <Briefcase className="mr-2" size={16} />
                  Add Your First Service
                </NeuButton>
              </div>
            )}
          </NeuCard>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredItems.map((item: any) => (
              <NeuCard key={item.id} className="overflow-hidden">
                {viewMode === 'grid' ? (
                  // Grid View
                  <div>
                    {/* Item Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {item.imageUrls && item.imageUrls.length > 0 ? (
                        <img
                          src={item.imageUrls[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.itemType === 'service' ? (
                            <Briefcase className="text-gray-400" size={48} />
                          ) : (
                            <Package className="text-gray-400" size={48} />
                          )}
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Stock/Type Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.itemType === 'service'
                            ? 'bg-blue-100 text-blue-800'
                            : item.inStock
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {item.itemType === 'service' ? 'Service' : (item.inStock ? 'In Stock' : 'Out of Stock')}
                        </span>
                      </div>
                    </div>

                    {/* Item Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-green-600">
                          ${item.itemType === 'service' ? item.basePrice : item.price}
                        </span>
                        {item.category && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <NeuButton
                          variant="default"
                          onClick={() => handleViewProduct(item.id)}
                          className="flex-1 text-sm"
                        >
                          <Eye className="mr-1" size={14} />
                          View
                        </NeuButton>
                        <NeuButton
                          variant="default"
                          onClick={() => handleEditProduct(item.id, item.itemType)}
                          className="flex-1 text-sm"
                        >
                          <Edit className="mr-1" size={14} />
                          Edit
                        </NeuButton>
                        <NeuButton
                          variant="default"
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-2"
                        >
                          <Trash2 className="text-red-600" size={14} />
                        </NeuButton>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                        {item.imageUrls && item.imageUrls.length > 0 ? (
                          <img
                            src={item.imageUrls[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {item.itemType === 'service' ? (
                              <Briefcase className="text-gray-400" size={24} />
                            ) : (
                              <Package className="text-gray-400" size={24} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {item.name}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.itemType === 'service'
                              ? 'bg-purple-100 text-purple-800'
                              : item.inStock
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {item.itemType === 'service' ? 'Service' : (item.inStock ? 'In Stock' : 'Out of Stock')}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="font-bold text-green-600">
                            ${item.itemType === 'service' ? item.basePrice : item.price}
                          </span>
                          {item.category && (
                            <span>{item.category}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <NeuButton
                          variant="default"
                          onClick={() => handleViewProduct(item.id)}
                          className="p-2"
                        >
                          <Eye size={16} />
                        </NeuButton>
                        <NeuButton
                          variant="default"
                          onClick={() => handleEditProduct(item.id, item.itemType)}
                          className="p-2"
                        >
                          <Edit size={16} />
                        </NeuButton>
                        <NeuButton
                          variant="default"
                          onClick={() => handleDeleteProduct(item.id)}
                          className="p-2"
                        >
                          <Trash2 className="text-red-600" size={16} />
                        </NeuButton>
                      </div>
                    </div>
                  </div>
                )}
              </NeuCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}