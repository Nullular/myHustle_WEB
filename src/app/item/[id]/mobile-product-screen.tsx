'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Share, 
  Heart, 
  Star, 
  ShoppingCart,
  Plus,
  Minus,
  Check
} from 'lucide-react';

import { NeuButton, NeuCard } from '@/components/ui';
import { Product, User } from '@/types/models';

export interface MobileProductScreenProps {
  product: Product;
  user: User | null;
  isFavorite: boolean;
  setIsFavorite: (isFavorite: boolean) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  selectedVariant: number;
  setSelectedVariant: (variant: number) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  currentPrice: number;
  handleAddToCart: () => void;
  isAddingToCart: boolean;
  isAddedToCart: boolean;
  handleShare: () => void;
}

export function MobileProductScreen({
  product,
  user,
  isFavorite,
  setIsFavorite,
  quantity,
  setQuantity,
  selectedVariant,
  setSelectedVariant,
  selectedSize,
  setSelectedSize,
  currentPrice,
  handleAddToCart,
  isAddingToCart,
  isAddedToCart,
  handleShare,
}: MobileProductScreenProps) {
  const router = useRouter();

  const getProductImageUrl = (item: any, index: number = 0) => {
    if (item.imageUrls && item.imageUrls.length > index) {
      return item.imageUrls[index];
    }
    if (item.primaryImageUrl) {
      return item.primaryImageUrl;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-2 py-2">
        <div className="flex justify-between items-center">
          <NeuButton onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </NeuButton>
          <h1 className="text-md font-semibold text-gray-800 truncate mx-2">
            Product Details
          </h1>
          <NeuButton onClick={handleShare} className="p-2">
            <Share className="h-5 w-5" />
          </NeuButton>
        </div>
      </div>

      {/* Image */}
      <div className="relative h-80">
        {getProductImageUrl(product) ? (
          <img
            src={getProductImageUrl(product)!}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
            {product.name.charAt(0)}
          </div>
        )}
        <NeuButton
          onClick={() => setIsFavorite(!isFavorite)}
          className={`absolute top-3 right-3 p-2 rounded-full ${isFavorite ? 'bg-red-100' : 'bg-white/80'}`}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
        </NeuButton>
      </div>

      <div className="p-4 pb-32">
        {/* Title and Rating */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-gray-500 text-sm">({product.totalReviews} reviews)</span>
          </div>
        </div>

        {/* Price */}
        <p className="text-2xl font-bold text-blue-600 mb-4">
          R{currentPrice.toFixed(2)}
        </p>

        {/* Variant Selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Color</h3>
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.variants.map((variant, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedVariant(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg cursor-pointer border-2 ${
                    selectedVariant === index ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <div className="w-full h-full rounded-md overflow-hidden bg-gray-100">
                    {variant.imageUrl ? (
                      <img
                        src={variant.imageUrl}
                        alt={variant.value}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                        {variant.value.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Size Selector */}
        {product.sizeVariants && product.sizeVariants.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizeVariants.map((sizeVariant) => (
                <button
                  key={sizeVariant.size}
                  onClick={() => setSelectedSize(sizeVariant.size)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedSize === sizeVariant.size
                      ? 'bg-blue-500 text-white border-blue-500 font-bold'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  {sizeVariant.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity</h3>
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
            <span className="text-gray-700">Number of items</span>
            <div className="flex items-center space-x-3">
              <NeuButton
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </NeuButton>
              <span className="text-xl font-bold">{quantity}</span>
              <NeuButton
                onClick={() => setQuantity(quantity + 1)}
                className="p-2"
              >
                <Plus className="h-4 w-4" />
              </NeuButton>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 leading-relaxed">{product.description}</p>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-blue-600">R{(currentPrice * quantity).toFixed(2)}</p>
          </div>
          <NeuButton
            onClick={handleAddToCart}
            disabled={isAddingToCart || isAddedToCart}
            className="w-1/2 h-12 text-md font-bold"
          >
            <div className="flex items-center justify-center space-x-2">
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              ) : isAddedToCart ? (
                <Check className="h-5 w-5" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              <span>
                {isAddingToCart ? 'Adding...' : isAddedToCart ? 'Added' : 'Add to Cart'}
              </span>
            </div>
          </NeuButton>
        </div>
      </div>
    </div>
  );
}
