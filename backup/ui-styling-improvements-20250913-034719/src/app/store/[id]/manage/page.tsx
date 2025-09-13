'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Store,
  Calendar,
  ShoppingCart,
  Plus,
  Package,
  BarChart3,
  Calculator,
  ChevronRight,
  Settings,
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { useShop } from '@/hooks/useShops';

interface ManagementOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  onClick: () => void;
}

export default function StoreManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const storeId = params.id as string;
  const { shop, loading, error } = useShop(storeId);

  // Check if user is the owner of this store
  const isOwner = user && shop && user.id === shop.ownerId;

  const handleBack = () => {
    router.back();
  };

  const managementOptions: ManagementOption[] = [
    {
      id: 'store_profile',
      title: 'Store Profile',
      description: 'Edit store information, images, and settings',
      icon: Settings,
      color: 'text-purple-600 bg-purple-100',
      onClick: () => {
        // Navigate to store profile editor
        router.push(`/store/${storeId}/profile`);
      }
    },
    {
      id: 'catalog_management',
      title: 'Catalog Management',
      description: 'Manage products, services, and inventory',
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
      onClick: () => {
        // Navigate to catalog management
        router.push(`/store/${storeId}/catalog`);
      }
    },
    {
      id: 'booking_management',
      title: 'Booking Management',
      description: 'Manage customer bookings and requests',
      icon: Calendar,
      color: 'text-green-600 bg-green-100',
      onClick: () => {
        // Navigate to booking management
        router.push(`/store/${storeId}/booking-management`);
      }
    },
    {
      id: 'order_management',
      title: 'Order Management',
      description: 'Manage customer orders and deliveries',
      icon: ShoppingCart,
      color: 'text-orange-600 bg-orange-100',
      onClick: () => {
        // Navigate to order management
        router.push(`/store/${storeId}/order-management`);
      }
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      description: 'View sales data and business insights',
      icon: BarChart3,
      color: 'text-emerald-600 bg-emerald-100',
      onClick: () => {
        // Navigate to analytics
        router.push(`/store/${storeId}/analytics`);
      }
    },
    {
      id: 'accounting',
      title: 'Basic Accounting',
      description: 'Track income, expenses, and profits',
      icon: Calculator,
      color: 'text-amber-600 bg-amber-100',
      onClick: () => {
        // Navigate to accounting
        router.push(`/store/${storeId}/accounting`);
      }
    }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <NeuCard className="p-8 text-center max-w-md mx-auto">
          <Store className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Store Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The store you are looking for does not exist.'}
          </p>
          <NeuButton onClick={handleBack}>
            Go Back
          </NeuButton>
        </NeuCard>
      </div>
    );
  }

  // Access control - only store owner can access management
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <NeuCard className="p-8 text-center max-w-md mx-auto">
          <Store className="mx-auto mb-4 text-yellow-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only the store owner can access the management dashboard.
          </p>
          <NeuButton onClick={handleBack}>
            Go Back
          </NeuButton>
        </NeuCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <NeuButton
            variant="default"
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft size={20} />
          </NeuButton>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Store Management</h1>
            <p className="text-gray-600 text-sm">
              {shop.name}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <NeuCard className="p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl mr-4">
              <Store className="text-blue-600" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Welcome to Store Management
              </h2>
              <p className="text-gray-600">
                Manage your business efficiently
              </p>
            </div>
          </div>
          
          <p className="text-gray-600 leading-relaxed">
            From here you can manage products, services, inventory, view analytics, 
            and handle basic accounting for your business.
          </p>
        </NeuCard>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
        </div>

        {/* Management Options */}
        <div className="space-y-4">
          {managementOptions.map((option) => (
            <ManagementOptionCard 
              key={option.id} 
              option={option} 
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="h-20"></div>
      </main>
    </div>
  );
}

interface ManagementOptionCardProps {
  option: ManagementOption;
}

const ManagementOptionCard: React.FC<ManagementOptionCardProps> = ({ option }) => {
  return (
    <button
      onClick={option.onClick}
      className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
    >
      <NeuCard className="p-4 hover:scale-[1.02] transition-all duration-300 group">
        <div className="flex items-center">
          {/* Icon */}
          <div className={`flex-shrink-0 p-3 rounded-xl ${option.color} mr-4`}>
            <option.icon size={24} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {option.title}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {option.description}
            </p>
          </div>

          {/* Arrow */}
          <div className="flex-shrink-0 ml-4">
            <ChevronRight 
              size={20} 
              className="text-gray-400 group-hover:text-blue-500 transition-colors" 
            />
          </div>
        </div>
      </NeuCard>
    </button>
  );
};
