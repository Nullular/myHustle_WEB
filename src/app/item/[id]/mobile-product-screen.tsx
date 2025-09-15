'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  Star, 
  ShoppingCart,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import ShareButton from '@/components/ui/ShareButton';
import { ReviewsList } from '@/components/reviews';
import { ReviewTargetType } from '@/types/Review';

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
    if (item.variants && item.variants[index] && item.variants[index].imageUrl) {
      return item.variants[index].imageUrl;
    }
    if (item.imageUrls && item.imageUrls.length > 0) {
      return item.imageUrls[0];
    }
    if (item.primaryImageUrl) {
      return item.primaryImageUrl;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Image Section */}
      <div className="relative h-96">
        <img
          src={getProductImageUrl(product, selectedVariant) ?? '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Top Buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <button onClick={() => router.back()} className="neu-card p-3 rounded-full" aria-label="Go back">
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <div className="flex space-x-2">
            <ShareButton onClick={handleShare} />
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`neu-card p-3 rounded-full ${isFavorite ? 'neu-pressed' : ''}`}
              aria-label="Favorite"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-800'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 pb-32 space-y-4 -mt-8">
        {/* Variant Selector */}
        {product.variants && product.variants.length > 1 && (
          <div className="flex justify-center">
            <div className="neu-card rounded-2xl p-2 inline-flex space-x-2">
              {product.variants.map((variant, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedVariant(index)}
                  className={`cursor-pointer w-16 h-16 rounded-lg overflow-hidden ${
                    selectedVariant === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <img
                    src={variant.imageUrl ?? '/placeholder.svg'}
                    alt={variant.value}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="neu-card rounded-2xl p-4">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center space-x-1 text-sm neu-pressed px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-bold">{product.rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-3">{product.category}</p>
          <p className="text-2xl font-bold text-gray-900">R{currentPrice.toFixed(2)}</p>
        </div>

        {product.sizeVariants && product.sizeVariants.length > 0 && (
          <div className="neu-card rounded-2xl p-4">
            <h3 className="text-md font-bold text-gray-800 mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizeVariants.map((sizeVariant) => (
                <button
                  key={sizeVariant.size}
                  onClick={() => setSelectedSize(sizeVariant.size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedSize === sizeVariant.size
                      ? 'neu-pressed'
                      : 'neu-card'
                  }`}
                >
                  {sizeVariant.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="neu-card rounded-2xl p-4">
          <h3 className="text-md font-bold text-gray-800 mb-3">Quantity</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Number of items</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="neu-card p-3 rounded-lg"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xl font-bold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="neu-card p-3 rounded-lg"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="neu-card rounded-2xl p-4">
          <h3 className="text-md font-bold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
        </div>

        {/* Reviews Section */}
        <div className="neu-card rounded-2xl p-4">
          <ReviewsList 
            targetType={ReviewTargetType.PRODUCT}
            targetId={product.id}
            targetName={product.name}
            shopId={product.shopId}
            showWriteReview={true}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 neu-card rounded-none border-t border-gray-200/60 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-blue-600">R{(currentPrice * quantity).toFixed(2)}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || isAddedToCart || !user}
            className="neu-pressed w-1/2 h-12 rounded-lg text-md font-bold text-white bg-blue-600 disabled:opacity-60"
          >
            <div className="flex items-center justify-center space-x-2">
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : isAddedToCart ? (
                <Check className="h-5 w-5" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              <span>
                {!user ? 'Login to Add' : isAddingToCart ? 'Adding...' : isAddedToCart ? 'Added' : 'Add to Cart'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
