import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { Order, OrderStatus } from '@/types/order';

export class OrderRepository {
  private static instance: OrderRepository;
  private ordersCollection = collection(db, 'orders');
  
  // Listeners for real-time updates
  private unsubscribeCustomerOrders?: () => void;
  private unsubscribeShopOwnerOrders?: () => void;
  
  // State management
  private customerOrdersCallbacks: ((orders: Order[]) => void)[] = [];
  private shopOwnerOrdersCallbacks: ((orders: Order[]) => void)[] = [];
  
  // Cached data
  private currentCustomerOrders: Order[] = [];
  private currentShopOwnerOrders: Order[] = [];
  
  private constructor() {
    this.setupAuthListener();
  }
  
  static getInstance(): OrderRepository {
    if (!OrderRepository.instance) {
      OrderRepository.instance = new OrderRepository();
    }
    return OrderRepository.instance;
  }
  
  private setupAuthListener() {
    auth.onAuthStateChanged((user: User | null) => {
      if (user) {
        this.startCustomerOrdersListener(user.uid);
        this.startShopOwnerOrdersListener(user.uid);
      } else {
        this.cleanup();
      }
    });
  }
  
  private startCustomerOrdersListener(userId: string) {
    this.cleanup('customer');
    
    // Listen for orders where current user is the customer
    const q = query(
      this.ordersCollection,
      where('customerId', '==', userId)
      // Note: No orderBy to avoid Firestore index requirement, we'll sort in memory
    );
    
    this.unsubscribeCustomerOrders = onSnapshot(q, 
      (snapshot) => {
        console.log('📦 Customer Orders listener update:', snapshot.docs.length, 'orders');
        
        const orders = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id, // Ensure document ID takes precedence over any id field in data
              createdAt: data.createdAt?.toMillis?.() || data.createdAt || 0,
              updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || 0,
              confirmedAt: data.confirmedAt?.toMillis?.() || data.confirmedAt || 0,
              shippedAt: data.shippedAt?.toMillis?.() || data.shippedAt || 0,
              deliveredAt: data.deliveredAt?.toMillis?.() || data.deliveredAt || 0,
              cancelledAt: data.cancelledAt?.toMillis?.() || data.cancelledAt || 0,
              estimatedDelivery: data.estimatedDelivery?.toMillis?.() || data.estimatedDelivery || 0,
            } as Order;
          })
          .sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date, newest first
        
        this.currentCustomerOrders = orders;
        this.customerOrdersCallbacks.forEach(callback => callback(orders));
      },
      (error) => {
        console.error('❌ Customer Orders listener error:', error);
      }
    );
  }
  
  private startShopOwnerOrdersListener(userId: string) {
    this.cleanup('shopOwner');
    
    // Listen for orders where current user is the shop owner
    const q = query(
      this.ordersCollection,
      where('ownerId', '==', userId)
      // Note: No orderBy to avoid Firestore index requirement, we'll sort in memory
    );
    
    this.unsubscribeShopOwnerOrders = onSnapshot(q, 
      (snapshot) => {
        console.log('📦 Shop Owner Orders listener update:', snapshot.docs.length, 'orders');
        
        const orders = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id, // Ensure document ID takes precedence over any id field in data
              createdAt: data.createdAt?.toMillis?.() || data.createdAt || 0,
              updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || 0,
              confirmedAt: data.confirmedAt?.toMillis?.() || data.confirmedAt || 0,
              shippedAt: data.shippedAt?.toMillis?.() || data.shippedAt || 0,
              deliveredAt: data.deliveredAt?.toMillis?.() || data.deliveredAt || 0,
              cancelledAt: data.cancelledAt?.toMillis?.() || data.cancelledAt || 0,
              estimatedDelivery: data.estimatedDelivery?.toMillis?.() || data.estimatedDelivery || 0,
            } as Order;
          })
          .sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date, newest first
        
        this.currentShopOwnerOrders = orders;
        this.shopOwnerOrdersCallbacks.forEach(callback => callback(orders));
      },
      (error) => {
        console.error('❌ Shop Owner Orders listener error:', error);
      }
    );
  }
  
  // Subscribe to customer orders (orders where user is the customer)
  subscribeToCustomerOrders(callback: (orders: Order[]) => void): () => void {
    this.customerOrdersCallbacks.push(callback);
    
    // Immediately call with current data if available
    if (this.currentCustomerOrders.length > 0) {
      callback(this.currentCustomerOrders);
    }
    
    return () => {
      this.customerOrdersCallbacks = this.customerOrdersCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Subscribe to shop owner orders (orders where user owns the shop)
  subscribeToShopOwnerOrders(callback: (orders: Order[]) => void): () => void {
    this.shopOwnerOrdersCallbacks.push(callback);
    
    // Immediately call with current data if available
    if (this.currentShopOwnerOrders.length > 0) {
      console.log('🏪 Repository: Immediately calling new subscriber with', this.currentShopOwnerOrders.length, 'cached orders');
      callback(this.currentShopOwnerOrders);
    }
    
    return () => {
      this.shopOwnerOrdersCallbacks = this.shopOwnerOrdersCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Update order status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(this.ordersCollection, orderId);
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };
      
      // Add status-specific timestamps
      switch (status) {
        case OrderStatus.CONFIRMED:
          updateData.confirmedAt = Timestamp.now();
          break;
        case OrderStatus.SHIPPED:
          updateData.shippedAt = Timestamp.now();
          break;
        case OrderStatus.DELIVERED:
          updateData.deliveredAt = Timestamp.now();
          break;
        case OrderStatus.CANCELLED:
          updateData.cancelledAt = Timestamp.now();
          break;
      }
      
      await updateDoc(orderRef, updateData);
      console.log('✅ Order status updated successfully:', orderId, status);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }
  
  // Get single order by ID
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderRef = doc(this.ordersCollection, orderId);
      const docSnap = await getDoc(orderRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || 0,
          updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || 0,
          confirmedAt: data.confirmedAt?.toMillis?.() || data.confirmedAt || 0,
          shippedAt: data.shippedAt?.toMillis?.() || data.shippedAt || 0,
          deliveredAt: data.deliveredAt?.toMillis?.() || data.deliveredAt || 0,
          cancelledAt: data.cancelledAt?.toMillis?.() || data.cancelledAt || 0,
          estimatedDelivery: data.estimatedDelivery?.toMillis?.() || data.estimatedDelivery || 0,
        } as Order;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching order:', error);
      throw error;
    }
  }

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber'>): Promise<string> {
    try {
      const newOrderRef = doc(this.ordersCollection);
      const orderNumber = `MH-${Date.now()}`;
      
      const finalOrderData = {
        ...orderData,
        id: newOrderRef.id,
        orderNumber,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await updateDoc(newOrderRef, finalOrderData);
      return newOrderRef.id;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }
  
  private cleanup(type?: 'customer' | 'shopOwner') {
    if (!type || type === 'customer') {
      if (this.unsubscribeCustomerOrders) {
        this.unsubscribeCustomerOrders();
        this.unsubscribeCustomerOrders = undefined;
      }
      this.currentCustomerOrders = [];
    }
    
    if (!type || type === 'shopOwner') {
      if (this.unsubscribeShopOwnerOrders) {
        this.unsubscribeShopOwnerOrders();
        this.unsubscribeShopOwnerOrders = undefined;
      }
      this.currentShopOwnerOrders = [];
    }
    
    if (!type) {
      this.customerOrdersCallbacks = [];
      this.shopOwnerOrdersCallbacks = [];
    }
  }
}

export const orderRepository = OrderRepository.getInstance();
