'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react';
import { useCartPage } from '@/hooks/useCartPage';

export function MobileCartScreen() {
  const {
    router,
    items,
    totalAmount,
    removeItem,
    updateQuantity,
    isSubmitting,
    handleRequestOrder,
  } = useCartPage();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="neu-card p-4 flex items-center">
          <button onClick={() => router.back()} className="neu-card p-3 rounded-full mr-4" aria-label="Go back">
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Cart</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="neu-pressed w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <button onClick={() => router.push('/')} className="neu-card px-8 py-3 rounded-lg font-semibold text-blue-600">
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="neu-card p-4 flex items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="neu-card p-3 rounded-full mr-4" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">My Cart</h1>
      </header>

      <main className="p-4 pb-32">
        <div className="neu-pressed rounded-2xl p-4 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Your Items</h2>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="neu-card rounded-xl p-3">
                <div className="flex items-center">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover mr-4" />
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2">{item.shopName}</h3>
                    <p className="text-sm text-gray-500">{item.shopName}</p>
                    <p className="font-bold text-blue-600 mt-1">R{item.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="neu-card p-2 rounded-full ml-2" aria-label="Remove item">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                <div className="flex items-center justify-end mt-2">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="neu-card p-2 rounded-lg" aria-label="Decrease quantity">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="neu-card p-2 rounded-lg" aria-label="Increase quantity">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="neu-pressed rounded-2xl p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Order Summary</h2>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total</span>
            <span className="font-bold text-2xl text-blue-600">R{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 neu-card p-4 border-t border-gray-200/60">
        <button
          onClick={handleRequestOrder}
          disabled={isSubmitting}
          className="w-full neu-pressed bg-blue-600 text-white h-14 rounded-lg font-bold flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
          ) : (
            <>
              <Send className="h-5 w-5 mr-2" />
              Request Order
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
