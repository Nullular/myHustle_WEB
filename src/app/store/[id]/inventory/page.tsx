'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { productRepository, serviceRepository } from '@/lib/firebase/repositories';
import { Product, Service } from '@/types/models';

interface InventoryItem {
  id: string;
  name: string;
  type: 'product' | 'service';
  category: string;
  currentStock: number;
  lowStockThreshold: number;
  price: number;
  imageUrl: string;
  active: boolean;
}

interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

interface InventoryPageProps {
  params: Promise<{ id: string }>;
}

export default function InventoryManagementPage({ params }: InventoryPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState<string>('');
  
  // Data state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'products' | 'services' | 'low-stock' | 'out-of-stock'>('all');

  // Load store ID from params
  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setStoreId(resolvedParams.id);
    };
    loadParams();
  }, [params]);

  // Load inventory data
  const loadInventoryData = async () => {
    if (!storeId || !user) return;

    setIsLoading(true);
    try {
      // Load products and services in parallel
      const [products, services] = await Promise.all([
        productRepository.getProductsByShop(storeId),
        serviceRepository.getServicesByShop(storeId)
      ]);

      // Convert to inventory items
      const productItems: InventoryItem[] = products.map(product => ({
        id: product.id,
        name: product.name,
        type: 'product' as const,
        category: product.category,
        currentStock: product.stockQuantity,
        lowStockThreshold: 5, // Default threshold
        price: product.price,
        imageUrl: product.primaryImageUrl,
        active: product.active
      }));

      const serviceItems: InventoryItem[] = services.map(service => ({
        id: service.id,
        name: service.name,
        type: 'service' as const,
        category: service.category,
        currentStock: 999, // Services don't have stock, using high number
        lowStockThreshold: 0,
        price: service.basePrice,
        imageUrl: service.primaryImageUrl,
        active: service.active
      }));

      const allItems = [...productItems, ...serviceItems];
      setInventoryItems(allItems);
      
      // Calculate stats
      const totalItems = allItems.length;
      const lowStockItems = allItems.filter(item => 
        item.type === 'product' && item.currentStock <= item.lowStockThreshold && item.currentStock > 0
      ).length;
      const outOfStockItems = allItems.filter(item => 
        item.type === 'product' && item.currentStock === 0
      ).length;
      const totalValue = allItems.reduce((sum, item) => 
        sum + (item.type === 'product' ? item.currentStock * item.price : 0), 0
      );

      setStats({
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue
      });

    } catch (error) {
      console.error('❌ Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (storeId && user) {
      loadInventoryData();
    }
  }, [storeId, user]);

  // Filter and search items
  useEffect(() => {
    let filtered = inventoryItems;

    // Apply type filter
    if (filterType === 'products') {
      filtered = filtered.filter(item => item.type === 'product');
    } else if (filterType === 'services') {
      filtered = filtered.filter(item => item.type === 'service');
    } else if (filterType === 'low-stock') {
      filtered = filtered.filter(item => 
        item.type === 'product' && item.currentStock <= item.lowStockThreshold && item.currentStock > 0
      );
    } else if (filterType === 'out-of-stock') {
      filtered = filtered.filter(item => 
        item.type === 'product' && item.currentStock === 0
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [inventoryItems, searchQuery, filterType]);

  const getStockStatus = (item: InventoryItem) => {
    if (item.type === 'service') return { status: 'available', color: 'text-green-600', text: 'Available' };
    if (item.currentStock === 0) return { status: 'out-of-stock', color: 'text-red-600', text: 'Out of Stock' };
    if (item.currentStock <= item.lowStockThreshold) return { status: 'low-stock', color: 'text-orange-600', text: 'Low Stock' };
    return { status: 'in-stock', color: 'text-green-600', text: 'In Stock' };
  };

  const handleItemClick = (item: InventoryItem) => {
    if (item.type === 'product') {
      router.push(`/store/${storeId}/products/${item.id}/edit`);
    } else {
      router.push(`/store/${storeId}/services/${item.id}/edit`);
    }
  };

  const handleAddItem = () => {
    // Navigate to add product screen
    router.push(`/store/${storeId}/add-product`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <NeuButton 
              variant="icon" 
              onClick={() => router.push(`/store/${storeId}/manage`)}
              className="p-3"
            >
              <ArrowLeft size={20} />
            </NeuButton>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Inventory Management</h1>
              <p className="text-sm text-gray-600">{stats.totalItems} items total</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NeuButton
              variant="icon"
              onClick={loadInventoryData}
              className="p-3"
            >
              <RefreshCw size={20} />
            </NeuButton>
            <NeuButton
              onClick={handleAddItem}
              className="flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Item</span>
            </NeuButton>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Inventory Stats */}
        <NeuCard className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Inventory Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
              <div className="text-sm text-gray-600">Low Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>
        </NeuCard>

        {/* Search and Filters */}
        <NeuCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Items</option>
                <option value="products">Products Only</option>
                <option value="services">Services Only</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </NeuCard>

        {/* Inventory Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800">
            Current Inventory ({filteredItems.length} items)
          </h3>
          
          {filteredItems.length === 0 ? (
            <NeuCard className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No items found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Add products or services to see them here'
                }
              </p>
              {!searchQuery && filterType === 'all' && (
                <NeuButton onClick={handleAddItem} className="mx-auto">
                  Add Your First Item
                </NeuButton>
              )}
            </NeuCard>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <div 
                    key={item.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleItemClick(item)}
                  >
                    <NeuCard className="p-4">
                      <div className="flex items-center space-x-4">
                      {/* Item Image */}
                      <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-blue-600" />
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.type === 'product' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <p className="text-sm font-medium text-blue-600">${item.price.toFixed(2)}</p>
                      </div>
                      
                      {/* Stock Status */}
                      <div className="text-right">
                        {item.type === 'product' && (
                          <p className="text-sm text-gray-600 mb-1">
                            Stock: {item.currentStock}
                          </p>
                        )}
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                        {stockStatus.status === 'low-stock' && (
                          <AlertTriangle className="h-4 w-4 text-orange-500 mt-1" />
                        )}
                      </div>
                    </div>
                  </NeuCard>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
