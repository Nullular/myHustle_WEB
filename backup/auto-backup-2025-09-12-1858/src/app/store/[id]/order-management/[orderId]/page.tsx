'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  MapPin,
  Package,
  Edit,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { useAuthStore } from '@/lib/store/auth';
import { orderRepository } from '@/lib/firebase/repositories/orderRepository';
import { useOrderStatusUpdate } from '@/hooks/useOrders';
import { Order, OrderStatus, getOrderStatusInfo } from '@/types/order';

interface OrderDetailsPageProps {
  params: Promise<{ id: string; orderId: string }>;
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [storeId, setStoreId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  
  const { updateOrderStatus, isUpdating } = useOrderStatusUpdate();

  // Resolve async params
  useEffect(() => {
    params.then(({ id, orderId: orderIdParam }) => {
      setStoreId(id);
      setOrderId(orderIdParam);
    });
  }, [params]);

  // Load order details
  useEffect(() => {
    if (!orderId) return;
    
    const loadOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderRepository.getOrderById(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    try {
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus, updatedAt: Date.now() });
      setShowStatusDialog(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      // Error is already handled in the hook
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <NeuButton onClick={() => router.back()}>
            Go Back
          </NeuButton>
        </div>
      </div>
    );
  }

  const statusInfo = getOrderStatusInfo(order.status);

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
              >
                <ArrowLeft size={20} />
              </NeuButton>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderNumber}</h1>
                <p className="text-gray-600 text-sm">
                  Order details and status
                </p>
              </div>
            </div>
            
            <NeuButton
              onClick={() => setShowStatusDialog(true)}
              className="flex items-center space-x-2"
            >
              <Edit size={16} />
              <span>Update Status</span>
            </NeuButton>
          </div>
        </header>

        <div className="px-4 py-6 space-y-6">
          {/* Order Status Section */}
          <NeuCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
              <div 
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{ 
                  backgroundColor: `${statusInfo.color}20`,
                  color: statusInfo.color,
                  border: `1px solid ${statusInfo.color}40`
                }}
              >
                {statusInfo.text}
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(order.createdAt)}</span>
              </div>
              
              {order.confirmedAt > 0 && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Confirmed: {formatDate(order.confirmedAt)}</span>
                </div>
              )}
              
              {order.shippedAt > 0 && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Shipped: {formatDate(order.shippedAt)}</span>
                </div>
              )}
              
              {order.deliveredAt > 0 && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Delivered: {formatDate(order.deliveredAt)}</span>
                </div>
              )}
            </div>
          </NeuCard>

          {/* Customer Information */}
          <NeuCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Customer Information</h2>
            </div>
            
            <div className="space-y-3">
              {order.customerInfo.name && (
                <InfoRow label="Name" value={order.customerInfo.name} />
              )}
              
              {order.customerInfo.email && (
                <InfoRow 
                  label="Email" 
                  value={order.customerInfo.email}
                  icon={<Mail className="h-4 w-4" />}
                />
              )}
              
              {order.customerInfo.phone && (
                <InfoRow 
                  label="Phone" 
                  value={order.customerInfo.phone}
                  icon={<Phone className="h-4 w-4" />}
                />
              )}
            </div>
          </NeuCard>

          {/* Delivery Information */}
          <NeuCard className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Delivery Information</h2>
            </div>
            
            <div className="space-y-3">
              <InfoRow 
                label="Method" 
                value={order.shippingMethod.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} 
              />
              
              {order.shippingAddress.street && (
                <InfoRow 
                  label="Address" 
                  value={`${order.shippingAddress.street}${order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}${order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}${order.shippingAddress.zipCode ? ` ${order.shippingAddress.zipCode}` : ''}`}
                />
              )}
              
              {order.trackingNumber && (
                <InfoRow label="Tracking" value={order.trackingNumber} />
              )}
            </div>
          </NeuCard>

          {/* Order Items */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Order Items ({order.items.length})
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <OrderItemCard key={index} item={item} />
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <NeuCard className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-2">
              <SummaryRow label="Subtotal" value={formatCurrency(order.subtotal)} />
              
              {order.deliveryFee > 0 && (
                <SummaryRow label="Delivery Fee" value={formatCurrency(order.deliveryFee)} />
              )}
              
              {order.tax > 0 && (
                <SummaryRow label="Tax" value={formatCurrency(order.tax)} />
              )}
              
              {order.discount > 0 && (
                <SummaryRow 
                  label="Discount" 
                  value={`-${formatCurrency(order.discount)}`}
                  className="text-green-600"
                />
              )}
              
              <div className="border-t pt-2 mt-3">
                <SummaryRow 
                  label="Total" 
                  value={formatCurrency(order.total)}
                  className="text-lg font-bold"
                />
              </div>
            </div>
          </NeuCard>

          {/* Notes */}
          {(order.customerNotes || order.internalNotes) && (
            <NeuCard className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Notes</h2>
              
              {order.customerNotes && (
                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">Customer Notes:</h3>
                  <p className="text-gray-600">{order.customerNotes}</p>
                </div>
              )}
              
              {order.internalNotes && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Internal Notes:</h3>
                  <p className="text-gray-600">{order.internalNotes}</p>
                </div>
              )}
            </NeuCard>
          )}

          {/* Bottom Spacing */}
          <div className="h-6"></div>
        </div>
      </div>

      {/* Status Update Dialog */}
      {showStatusDialog && (
        <OrderStatusDialog
          currentStatus={order.status}
          onStatusSelected={handleStatusUpdate}
          onClose={() => setShowStatusDialog(false)}
          isUpdating={isUpdating}
        />
      )}
    </div>
  );
}

// Helper Components
function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-gray-600 font-medium">{label}:</span>
      </div>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between py-1 ${className}`}>
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function OrderItemCard({ item }: { item: any }) {
  return (
    <NeuCard className="p-4">
      <div className="flex items-center space-x-4">
        {/* Item Image */}
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
              {item.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="flex-1">
          <h3 className="font-bold text-lg">{item.name}</h3>
          {item.sku && (
            <p className="text-sm text-gray-500">SKU: {item.sku}</p>
          )}
          {item.variantName && (
            <p className="text-sm text-gray-600">{item.variantName}</p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">
              Quantity: {item.quantity}
            </span>
            <span className="font-bold text-lg">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </NeuCard>
  );
}

function OrderStatusDialog({ 
  currentStatus, 
  onStatusSelected, 
  onClose, 
  isUpdating 
}: { 
  currentStatus: OrderStatus;
  onStatusSelected: (status: OrderStatus) => void;
  onClose: () => void;
  isUpdating: boolean;
}) {
  const statuses = Object.values(OrderStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4">Update Order Status</h3>
        
        <div className="space-y-2 mb-6">
          {statuses.map((status) => {
            const statusInfo = getOrderStatusInfo(status);
            const isSelected = status === currentStatus;
            
            return (
              <button
                key={status}
                onClick={() => onStatusSelected(status)}
                disabled={isUpdating || isSelected}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  isSelected 
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{statusInfo.text}</span>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: statusInfo.color }}
                  />
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
