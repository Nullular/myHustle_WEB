import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../config';
import { Product } from '@/types/models';

/**
 * Firebase Product Repository - Replicates Android product queries
 * Handles products with same patterns as Android app
 */
class FirebaseProductRepository {
  private static instance: FirebaseProductRepository;
  
  private constructor() {}
  
  static getInstance(): FirebaseProductRepository {
    if (!FirebaseProductRepository.instance) {
      FirebaseProductRepository.instance = new FirebaseProductRepository();
    }
    return FirebaseProductRepository.instance;
  }
  
  /**
   * Get all products for a specific shop (matches Android pattern)
   * Uses combined query to satisfy Firestore security rules
   */
  async getProductsByShop(shopId: string): Promise<Product[]> {
    try {
      console.log(`🔥 Fetching products for shop ${shopId}`);
      
      // Combined query to satisfy Firestore security rules (only active products can be read)
      const productsQuery = query(
        collection(db, 'products'),
        where('shopId', '==', shopId),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(productsQuery);
      console.log(`🔥 Fetched ${snapshot.docs.length} active product documents for shop`);
      
      const products: Product[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const product: Product = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Product;
          
          console.log(`✅ Successfully parsed active product for shop: ${product.name}`);
          products.push(product);
        } catch (e) {
          console.error(`❌ Failed to parse product document ${document.id}`, e);
          // Skip invalid documents like Android does
        }
      });
      
      // Sort in code instead of query (like Android does)
      return products.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('❌ Error fetching shop products:', error);
      return [];
    }
  }
  
  /**
   * Get all active products (for marketplace view)
   */
  async getActiveProducts(): Promise<Product[]> {
    try {
      console.log('🔥 Fetching all active products');
      
      // Simplified query without orderBy to avoid index requirements
      const productsQuery = query(
        collection(db, 'products'),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(productsQuery);
      console.log(`🔥 Fetched ${snapshot.docs.length} active product documents`);
      
      const products: Product[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const product: Product = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Product;
          
          console.log(`✅ Successfully parsed active product: ${product.name}`);
          products.push(product);
        } catch (e) {
          console.error(`❌ Failed to parse product document ${document.id}`, e);
        }
      });
      
      console.log(`✅ Successfully parsed ${products.length} active products`);
      return products;
    } catch (error) {
      console.error('❌ Error fetching active products:', error);
      return [];
    }
  }
  
  /**
   * Get a product by its unique ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', id);
      const document = await getDoc(docRef);
      
      if (!document.exists()) {
        return null;
      }
      
      const data = document.data();
      const product: Product = {
        id: document.id,
        ...data,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      } as Product;
      
      return product;
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Get products by owner ID (for business dashboard)
   */
  async getProductsByOwner(ownerId: string): Promise<Product[]> {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(productsQuery);
      
      const products: Product[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const product: Product = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Product;
          
          products.push(product);
        } catch (e) {
          console.error(`❌ Failed to parse product document ${document.id}`, e);
        }
      });
      
      return products;
    } catch (error) {
      console.error(`❌ Error fetching products for owner ${ownerId}:`, error);
      return [];
    }
  }
  
  /**
   * Add a new product
   */
  async addProduct(product: Omit<Product, 'id'>): Promise<string | null> {
    try {
      const productData = {
        ...product,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const docRef = await addDoc(collection(db, 'products'), productData);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding product:', error);
      return null;
    }
  }
  
  /**
   * Update an existing product
   */
  async updateProduct(product: Product): Promise<boolean> {
    try {
      const docRef = doc(db, 'products', product.id);
      const { id, createdAt, ...updateData } = product;
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Date.now(),
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Error updating product ${product.id}:`, error);
      return false;
    }
  }
  
  /**
   * Delete a product
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'products', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting product ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Search products by name or description
   */
  async searchProducts(searchTerm: string, limit: number = 20): Promise<Product[]> {
    try {
      // Note: Firestore doesn't have full-text search, so this is a simple implementation
      // For production, consider using Algolia or similar
      const productsQuery = query(
        collection(db, 'products'),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const snapshot = await getDocs(productsQuery);
      
      const products: Product[] = [];
      const searchLower = searchTerm.toLowerCase();
      
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const product: Product = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Product;
          
          // Simple text matching
          if (
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchLower))
          ) {
            products.push(product);
          }
        } catch (e) {
          console.error(`❌ Failed to parse product document ${document.id}`, e);
        }
      });
      
      return products.slice(0, limit);
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return [];
    }
  }
}

// Export singleton instance
export const productRepository = FirebaseProductRepository.getInstance();
