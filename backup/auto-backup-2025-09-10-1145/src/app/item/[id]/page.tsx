'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { useAuthStore } from '@/lib/store/auth';
import { useCartStore } from '@/lib/store/cart';
import { productRepository } from '@/lib/firebase/repositories';
import { Product } from '@/types/models';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  
  // Product state
  const [productId, setProductId] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Resolve async params
  useEffect(() => {
    params.then(({ id }) => setProductId(id));
  }, [params]);

  // Load product data
  useEffect(() => {
    if (!productId) return;
    
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await productRepository.getProductById(productId);
        if (productData) {
          setProduct(productData);
          setIsFavorite(false); // TODO: Implement favorite functionality
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  // Get product image URL with fallbacks
  const getProductImageUrl = (item: any, index: number = 0) => {
    if (item.imageUrls && item.imageUrls.length > index) {
      return item.imageUrls[index];
    }
    if (item.primaryImageUrl) {
      return item.primaryImageUrl;
    }
    return null;
  };

  // Calculate current price based on selected variant/size
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    
    // Check size variants first
    if (product.sizeVariants && product.sizeVariants.length > 0) {
      const sizeVariant = product.sizeVariants.find(sv => sv.size === selectedSize);
      if (sizeVariant) return sizeVariant.price;
    }
    
    // Check color/style variants
    if (product.variants && product.variants.length > 0 && selectedVariant < product.variants.length) {
      return product.variants[selectedVariant].price;
    }
    
    // Default to base price
    return product.price;
  }, [product, selectedVariant, selectedSize]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      const selectedVariantData = product.variants && product.variants.length > 0 
        ? product.variants[selectedVariant] 
        : null;
        
      const selectedSizeData = product.sizeVariants && product.sizeVariants.length > 0
        ? product.sizeVariants.find(sv => sv.size === selectedSize)
        : null;

      // Create cart item
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: currentPrice,
        quantity: quantity,
        image: getProductImageUrl(product) || undefined,
        storeId: product.shopId,
        storeName: 'Store' // TODO: Get shop name from shop repository
      };

      addItem(cartItem);
      setIsAddedToCart(true);
      
      // Show success state then navigate to cart
      setTimeout(() => {
        router.push('/checkout');
      }, 1500);
      
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  // Loading state
  if (!productId || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <NeuButton onClick={() => router.back()}>
            Go Back
          </NeuButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <NeuButton
            onClick={() => router.back()}
            className="p-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </NeuButton>
          
          <h1 className="text-lg font-bold text-gray-800 truncate mx-4">
            Product Details
          </h1>

          <NeuButton
            onClick={handleShare}
            className="p-3"
          >
            <Share className="h-5 w-5" />
          </NeuButton>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6">
        {/* Product Image */}
        <div className="relative h-96 mt-6 mb-6">
          <NeuCard className="h-full overflow-hidden">
            {getProductImageUrl(product) ? (
              <img
                src={getProductImageUrl(product)!}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {product.name.charAt(0)}
              </div>
            )}
            
            {/* Favorite Button */}
            <NeuButton
              onClick={() => setIsFavorite(!isFavorite)}
              className={`absolute top-4 right-4 p-3 ${isFavorite ? 'bg-red-50' : 'bg-white bg-opacity-90'}`}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-current' : ''}`} />
            </NeuButton>
          </NeuCard>
        </div>

        {/* Variant Selector */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6">
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.variants.map((variant, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedVariant(index)}
                  className={`flex-shrink-0 w-20 h-20 cursor-pointer ${
                    selectedVariant === index ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <NeuCard className={`w-full h-full overflow-hidden ${
                    selectedVariant === index ? 'shadow-inner' : ''
                  }`}>
                    {variant.imageUrl ? (
                      <img
                        src={variant.imageUrl}
                        alt={variant.value}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold">
                        {variant.value.charAt(0)}
                      </div>
                    )}
                  </NeuCard>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Info Card */}
        <NeuCard className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.category}</p>
            </div>
            
            <div className="flex items-center space-x-1 ml-4">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="font-medium">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-3xl font-bold text-blue-600">
              R{currentPrice.toFixed(2)}
            </span>
          </div>

          {/* Size Selector */}
          {product.sizeVariants && product.sizeVariants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizeVariants.map((sizeVariant) => (
                  <NeuButton
                    key={sizeVariant.size}
                    onClick={() => setSelectedSize(sizeVariant.size)}
                    className={`px-4 py-2 min-w-12 ${
                      selectedSize === sizeVariant.size
                        ? 'shadow-inner bg-blue-50 text-blue-600 font-bold'
                        : ''
                    }`}
                  >
                    {sizeVariant.size}
                  </NeuButton>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Quantity</h3>
              
              <div className="flex items-center space-x-4">
                <NeuButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </NeuButton>
                
                <span className="text-xl font-bold min-w-8 text-center">{quantity}</span>
                
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
          <div>
            <h3 className="text-lg font-medium mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        </NeuCard>

        {/* Reviews Section */}
        <NeuCard className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          <div className="text-center py-8 text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Reviews system coming soon...</p>
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-bold text-lg">{product.rating.toFixed(1)}</span>
                <span className="text-gray-500">({product.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </NeuCard>

        {/* Add to Cart Button */}
        <div className="sticky bottom-0 bg-gradient-to-br from-gray-50 to-gray-100 pt-4">
          <NeuButton
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className={`w-full h-14 text-lg font-bold ${
              isAddedToCart
                ? 'bg-green-50 text-green-600 shadow-inner'
                : isAddingToCart
                ? 'opacity-75'
                : 'text-green-600 hover:bg-green-50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600" />
              ) : isAddedToCart ? (
                <Check className="h-5 w-5" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              <span>
                {!user
                  ? `Login to Add • R${(currentPrice * quantity).toFixed(2)}`
                  : isAddingToCart
                  ? 'Adding to Cart...'
                  : isAddedToCart
                  ? 'Added! Going to Cart...'
                  : `Add to Cart • R${(currentPrice * quantity).toFixed(2)}`
                }
              </span>
            </div>
          </NeuButton>
        </div>
      </div>
    </div>
  );
}
