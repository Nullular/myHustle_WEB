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
import { useResponsive } from '@/hooks/useResponsive';
import { DesktopProductScreen } from './desktop-product-screen';
import { MobileProductScreen } from './mobile-product-screen';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { isMobile } = useResponsive();
  
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
        imageUrl: getProductImageUrl(product) || undefined,
        shopId: product.shopId,
        shopName: 'Store' // TODO: Get shop name from shop repository
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

  const screenProps = {
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
  };

  return isMobile ? <MobileProductScreen {...screenProps} /> : <DesktopProductScreen {...screenProps} />;
}
