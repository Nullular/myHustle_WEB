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
import { Service } from '@/types/models';

/**
 * Firebase Service Repository - Replicates Android service queries
 * Handles services with same patterns as Android app
 */
class FirebaseServiceRepository {
  private static instance: FirebaseServiceRepository;
  
  private constructor() {}
  
  static getInstance(): FirebaseServiceRepository {
    if (!FirebaseServiceRepository.instance) {
      FirebaseServiceRepository.instance = new FirebaseServiceRepository();
    }
    return FirebaseServiceRepository.instance;
  }
  
  /**
   * Get all services for a specific shop (matches Android pattern)
   * Uses combined query to satisfy Firestore security rules
   */
  async getServicesByShop(shopId: string): Promise<Service[]> {
    try {
      console.log(`🔥 Fetching services for shop ${shopId}`);
      
      // Combined query to satisfy Firestore security rules (only active services can be read)
      const servicesQuery = query(
        collection(db, 'services'),
        where('shopId', '==', shopId),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(servicesQuery);
      console.log(`🔥 Fetched ${snapshot.docs.length} active service documents for shop`);
      
      const services: Service[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const service: Service = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Service;
          
          console.log(`✅ Successfully parsed active service for shop: ${service.name}`);
          services.push(service);
        } catch (e) {
          console.error(`❌ Failed to parse service document ${document.id}`, e);
          // Skip invalid documents like Android does
        }
      });
      
      // Sort in code instead of query (like Android does)
      return services.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('❌ Error fetching shop services:', error);
      return [];
    }
  }
  
  /**
   * Get all active services (for marketplace view)
   */
  async getActiveServices(): Promise<Service[]> {
    try {
      console.log('🔥 Fetching all active services');
      
      // Simplified query without orderBy to avoid index requirements
      const servicesQuery = query(
        collection(db, 'services'),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(servicesQuery);
      console.log(`🔥 Fetched ${snapshot.docs.length} active service documents`);
      
      const services: Service[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const service: Service = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Service;
          
          console.log(`✅ Successfully parsed active service: ${service.name}`);
          services.push(service);
        } catch (e) {
          console.error(`❌ Failed to parse service document ${document.id}`, e);
        }
      });
      
      console.log(`✅ Successfully parsed ${services.length} active services`);
      return services;
    } catch (error) {
      console.error('❌ Error fetching active services:', error);
      return [];
    }
  }
  
  /**
   * Get a service by its unique ID
   */
  async getServiceById(id: string): Promise<Service | null> {
    try {
      const docRef = doc(db, 'services', id);
      const document = await getDoc(docRef);
      
      if (!document.exists()) {
        return null;
      }
      
      const data = document.data();
      const service: Service = {
        id: document.id,
        ...data,
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      } as Service;
      
      return service;
    } catch (error) {
      console.error(`❌ Error fetching service ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Get services by owner ID (for business dashboard)
   */
  async getServicesByOwner(ownerId: string): Promise<Service[]> {
    try {
      const servicesQuery = query(
        collection(db, 'services'),
        where('ownerId', '==', ownerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(servicesQuery);
      
      const services: Service[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const service: Service = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Service;
          
          services.push(service);
        } catch (e) {
          console.error(`❌ Failed to parse service document ${document.id}`, e);
        }
      });
      
      return services;
    } catch (error) {
      console.error(`❌ Error fetching services for owner ${ownerId}:`, error);
      return [];
    }
  }
  
  /**
   * Get bookable services for a shop (only services where isBookable = true)
   */
  async getBookableServicesByShop(shopId: string): Promise<Service[]> {
    try {
      const servicesQuery = query(
        collection(db, 'services'),
        where('shopId', '==', shopId),
        where('isActive', '==', true),
        where('isBookable', '==', true)
      );
      
      const snapshot = await getDocs(servicesQuery);
      
      const services: Service[] = [];
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const service: Service = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Service;
          
          services.push(service);
        } catch (e) {
          console.error(`❌ Failed to parse bookable service document ${document.id}`, e);
        }
      });
      
      return services.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error(`❌ Error fetching bookable services for shop ${shopId}:`, error);
      return [];
    }
  }
  
  /**
   * Add a new service
   */
  async addService(service: Omit<Service, 'id'>): Promise<string | null> {
    try {
      const serviceData = {
        ...service,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const docRef = await addDoc(collection(db, 'services'), serviceData);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding service:', error);
      return null;
    }
  }
  
  /**
   * Update an existing service
   */
  async updateService(service: Service): Promise<boolean> {
    try {
      const docRef = doc(db, 'services', service.id);
      const { id, createdAt, ...updateData } = service;
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Date.now(),
      });
      
      return true;
    } catch (error) {
      console.error(`❌ Error updating service ${service.id}:`, error);
      return false;
    }
  }
  
  /**
   * Delete a service
   */
  async deleteService(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'services', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`❌ Error deleting service ${id}:`, error);
      return false;
    }
  }
  
  /**
   * Search services by name or description
   */
  async searchServices(searchTerm: string, limit: number = 20): Promise<Service[]> {
    try {
      const servicesQuery = query(
        collection(db, 'services'),
        where('isActive', '==', true),
        orderBy('name')
      );
      
      const snapshot = await getDocs(servicesQuery);
      
      const services: Service[] = [];
      const searchLower = searchTerm.toLowerCase();
      
      snapshot.docs.forEach((document) => {
        try {
          const data = document.data();
          const service: Service = {
            id: document.id,
            ...data,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now(),
          } as Service;
          
          // Simple text matching
          if (
            service.name.toLowerCase().includes(searchLower) ||
            service.description.toLowerCase().includes(searchLower) ||
            service.tags.some(tag => tag.toLowerCase().includes(searchLower))
          ) {
            services.push(service);
          }
        } catch (e) {
          console.error(`❌ Failed to parse service document ${document.id}`, e);
        }
      });
      
      return services.slice(0, limit);
    } catch (error) {
      console.error('❌ Error searching services:', error);
      return [];
    }
  }
}

// Export singleton instance
export const serviceRepository = FirebaseServiceRepository.getInstance();
