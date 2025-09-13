'use client';

import React from 'react';
import { 
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { useCartStore } from '@/lib/store/cart';
import { CartItem } from '@/types';

interface CartItemCardProps {
  item: CartItem;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.productId);
    } else {
      updateQuantity(item.productId, newQuantity);
    }
  };

  const getProductImageUrl = () => {
    return item.imageUrl || '/placeholder.svg';
  };

  return (
    <div className="neu-card p-4 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Top row: Image, Details, and Remove Button */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Product Image */}
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={getProductImageUrl()}
              alt={item.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.shopName || 'Store'}</p>
            <p className="text-lg font-bold text-purple-600">${item.price.toFixed(2)}</p>
          </div>

          {/* Remove Button - always on the right */}
          <button
            onClick={() => removeItem(item.productId)}
            className="neu-card p-2 rounded-lg text-red-500 hover:text-red-700 flex-shrink-0"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity Controls - stacked on mobile, inline on desktop */}
        <div className="flex items-center justify-center sm:justify-end space-x-3 sm:flex-shrink-0">
          <button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="neu-card p-2 rounded-lg"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4 text-gray-800" />
          </button>
          
          <span className="w-8 text-center font-semibold text-gray-800">
            {item.quantity}
          </span>
          
          <button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="neu-card p-2 rounded-lg"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4 text-gray-800" />
          </button>
        </div>
      </div>
    </div>
  );
}