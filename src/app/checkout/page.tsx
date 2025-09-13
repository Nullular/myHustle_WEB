'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingCart
} from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { useAuthStore } from '@/lib/store/auth';
import { CartItemCard } from '@/components/ui';
import { checkoutService } from '@/lib/services/checkoutService';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, totalAmount, clearCart } = useCartStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Calculate order totals
  const subtotal = totalAmount;
  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (items.length === 0) {
      return;
    }

    setIsProcessing(true);
    setCheckoutError(null);

    try {
      console.log('🛒 Starting checkout process...');
      const result = await checkoutService.processCheckout();
      
      if (result.success) {
        console.log('✅ Checkout successful:', result.orderIds);
        setCheckoutSuccess(true);
        
        // Show success then redirect to special page
        setTimeout(() => {
          router.push('/order-success');
        }, 1500);
      } else {
        console.error('❌ Checkout failed:', result.message);
        setCheckoutError(result.message);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('❌ Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Checkout failed');
      setIsProcessing(false);
    }
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="neu-card p-4 mb-4 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="neu-card p-3 rounded-full mr-4"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
        </div>

        {/* Empty State */}
        <div className="p-6 flex flex-col items-center justify-center min-h-96">
          <div className="neu-card p-8 rounded-2xl text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some items to get started</p>
            <button
              onClick={() => router.push('/')}
              className="neu-button px-6 py-3 rounded-full font-semibold text-purple-600"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="neu-card p-4 mb-4 flex items-center">
        <button 
          onClick={() => router.back()} 
          className="neu-card p-3 rounded-full mr-4"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
      </div>

      <div className="p-4 pb-32 space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Your Items</h2>
          {items.map((item) => (
            <CartItemCard key={item.productId} item={item} />
          ))}
        </div>

        {/* Order Summary */}
        <div className="neu-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Total</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Items</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium">${deliveryFee.toFixed(2)}</span>
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-lg font-bold text-purple-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {checkoutError && (
          <div className="neu-card p-4 rounded-2xl bg-red-50 border border-red-200">
            <p className="text-red-600 text-center">{checkoutError}</p>
          </div>
        )}
      </div>

      {/* Checkout Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-100">
        <button
          onClick={handleCheckout}
          disabled={isProcessing || items.length === 0}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
            isProcessing
              ? 'neu-pressed bg-gray-200 text-gray-500'
              : checkoutSuccess
              ? 'neu-pressed bg-green-200 text-green-800'
              : 'neu-button bg-purple-600 text-white'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : checkoutSuccess ? (
            'Order Placed Successfully!'
          ) : (
            `Place Order • $${total.toFixed(2)}`
          )}
        </button>
      </div>
    </div>
  );
}