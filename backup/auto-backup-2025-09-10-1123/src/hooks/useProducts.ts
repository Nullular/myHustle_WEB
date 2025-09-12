import { useState, useEffect, useCallback } from 'react';
import { productRepository, serviceRepository } from '@/lib/firebase/repositories';
import { Product, Service } from '@/types/models';

/**
 * Hook for managing products by shop
 */
export function useShopProducts(shopId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!shopId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const shopProducts = await productRepository.getProductsByShop(shopId);
        
        if (mounted) {
          setProducts(shopProducts);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch products');
          setLoading(false);
        }
      }
    };
    
    fetchProducts();
    
    return () => {
      mounted = false;
    };
  }, [shopId]);
  
  return {
    products,
    loading,
    error
  };
}

/**
 * Hook for managing services by shop
 */
export function useShopServices(shopId: string | null) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!shopId) {
      setServices([]);
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const shopServices = await serviceRepository.getServicesByShop(shopId);
        
        if (mounted) {
          setServices(shopServices);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch services');
          setLoading(false);
        }
      }
    };
    
    fetchServices();
    
    return () => {
      mounted = false;
    };
  }, [shopId]);
  
  return {
    services,
    loading,
    error
  };
}

/**
 * Hook for getting all active products (marketplace view)
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const allProducts = await productRepository.getActiveProducts();
        
        if (mounted) {
          setProducts(allProducts);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch products');
          setLoading(false);
        }
      }
    };
    
    fetchProducts();
    
    return () => {
      mounted = false;
    };
  }, []);
  
  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const freshProducts = await productRepository.getActiveProducts();
      setProducts(freshProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh products');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    products,
    loading,
    error,
    refreshProducts
  };
}

/**
 * Hook for getting a single product by ID
 */
export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const productData = await productRepository.getProductById(productId);
        
        if (mounted) {
          setProduct(productData);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch product');
          setLoading(false);
        }
      }
    };
    
    fetchProduct();
    
    return () => {
      mounted = false;
    };
  }, [productId]);
  
  return {
    product,
    loading,
    error
  };
}

/**
 * Hook for managing products owned by current user
 */
export function useOwnedProducts(ownerId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!ownerId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    const fetchOwnedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ownedProducts = await productRepository.getProductsByOwner(ownerId);
        
        if (mounted) {
          setProducts(ownedProducts);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch owned products');
          setLoading(false);
        }
      }
    };
    
    fetchOwnedProducts();
    
    return () => {
      mounted = false;
    };
  }, [ownerId]);
  
  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    try {
      const productId = await productRepository.addProduct(productData);
      if (productId && ownerId) {
        // Refresh the list
        const updatedProducts = await productRepository.getProductsByOwner(ownerId);
        setProducts(updatedProducts);
      }
      return productId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product');
      return null;
    }
  }, [ownerId]);
  
  const updateProduct = useCallback(async (product: Product) => {
    try {
      const success = await productRepository.updateProduct(product);
      if (success && ownerId) {
        // Refresh the list
        const updatedProducts = await productRepository.getProductsByOwner(ownerId);
        setProducts(updatedProducts);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      return false;
    }
  }, [ownerId]);
  
  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const success = await productRepository.deleteProduct(productId);
      if (success && ownerId) {
        // Refresh the list
        const updatedProducts = await productRepository.getProductsByOwner(ownerId);
        setProducts(updatedProducts);
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  }, [ownerId]);
  
  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct
  };
}

/**
 * Hook for searching products
 */
export function useProductSearch() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchProducts = useCallback(async (searchTerm: string, limit: number = 20) => {
    if (!searchTerm.trim()) {
      setProducts([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const searchResults = await productRepository.searchProducts(searchTerm, limit);
      setProducts(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const clearSearch = useCallback(() => {
    setProducts([]);
    setError(null);
  }, []);
  
  return {
    products,
    loading,
    error,
    searchProducts,
    clearSearch
  };
}
