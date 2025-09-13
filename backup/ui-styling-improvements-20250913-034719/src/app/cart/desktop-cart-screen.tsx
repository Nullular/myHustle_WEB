'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react';
import { NeuButton, NeuCard } from '@/components/ui';
import { useCartPage } from '@/hooks/useCartPage';

export function DesktopCartScreen() {
  const {
    items,
    totalAmount,
    totalItems,
    removeItem,
    updateQuantity,
    isSubmitting,
    message,
    setMessage,
    handleRequestOrder,
  } = useCartPage();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <NeuButton
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </NeuButton>
            <h1 className="text-xl font-bold text-gray-800">Cart</h1>
          </div>

          {/* Empty State */}
          <NeuCard className="p-8 text-center">
            <ShoppingBag className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Empty Cart</h3>
            <p className="text-gray-600 mb-4">
              Add some products to get started
            </p>
            <NeuButton onClick={() => router.push('/')}>
              Browse Products
            </NeuButton>
          </NeuCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <NeuButton
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </NeuButton>
            <h1 className="text-xl font-bold text-gray-800">Cart</h1>
          </div>
          <span className="text-blue-600 font-medium">{totalItems} items</span>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <NeuCard key={`${item.productId}-${item.variantId}`} className="p-4">
              <div className="flex items-center space-x-4">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.shopName}</p>
                  {item.variantName && (
                    <p className="text-xs text-gray-500">{item.variantName}</p>
                  )}
                  <p className="text-blue-600 font-bold">R{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <NeuButton
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </NeuButton>
                  
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  
                  <NeuButton
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </NeuButton>

                  <NeuButton
                    onClick={() => removeItem(item.productId)}
                    className="ml-2 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </NeuButton>
                </div>
              </div>
            </NeuCard>
          ))}
        </div>

        {/* Order Notes */}
        <NeuCard className="p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Any special requests or notes for the store owner..."
          />
        </NeuCard>

        {/* Total & Submit */}
        <NeuCard className="p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold text-blue-600">R{totalAmount.toFixed(2)}</span>
          </div>
          
          <NeuButton
            onClick={handleRequestOrder}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
          >
            {isSubmitting ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Request Order
              </>
            )}
          </NeuButton>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            Your order request will be sent to the store owners for approval
          </p>
        </NeuCard>
      </div>
    </div>
  );
}
