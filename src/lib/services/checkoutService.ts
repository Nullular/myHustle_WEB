import { auth } from '@/lib/firebase/config';
import { useCartStore } from '@/lib/store/cart';
import { orderRepository, shopRepository } from '@/lib/firebase/repositories';
import { 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentStatus, 
  FulfillmentStatus,
  ShippingMethod,
  CustomerInfo,
  ShippingAddress
} from '@/types/order';
import { CartItem } from '@/types';

interface CheckoutResult {
  success: boolean;
  orderIds: string[];
  message: string;
}

export class CheckoutService {
  private static instance: CheckoutService;

  static getInstance(): CheckoutService {
    if (!CheckoutService.instance) {
      CheckoutService.instance = new CheckoutService();
    }
    return CheckoutService.instance;
  }

  async processCheckout(): Promise<CheckoutResult> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { items: cartItems, clearCart } = useCartStore.getState();
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      console.log('🛒 Processing checkout for', cartItems.length, 'items');

      const orderIds: string[] = [];

      // Group cart items by shop
      const itemsByShop = cartItems.reduce((groups, item) => {
        const shopId = item.shopId;
        if (!groups[shopId]) {
          groups[shopId] = [];
        }
        groups[shopId].push(item);
        return groups;
      }, {} as Record<string, typeof cartItems>);

      // Create an order for each shop
      for (const [shopId, shopItems] of Object.entries(itemsByShop)) {
        const orderId = await this.createOrderForShop(shopId, shopItems, currentUser);
        orderIds.push(orderId);
      }

      // Clear the cart after successful checkout
      clearCart();

      console.log('✅ Checkout successful - Orders created:', orderIds);

      return {
        success: true,
        orderIds,
        message: 'Orders placed successfully!'
      };

    } catch (error) {
      console.error('❌ Checkout failed:', error);
      return {
        success: false,
        orderIds: [],
        message: error instanceof Error ? error.message : 'Checkout failed'
      };
    }
  }

  private async createOrderForShop(
    shopId: string,
    cartItems: CartItem[],
    currentUser: any
  ): Promise<string> {
    // Get shop information to get the owner ID
    const shop = await shopRepository.getShopById(shopId);
    if (!shop) {
      throw new Error(`Shop not found: ${shopId}`);
    }

    // Convert cart items to order items
    const orderItems: OrderItem[] = cartItems.map(cartItem => ({
      productId: cartItem.productId || '',
      name: cartItem.name,
      sku: '', // Could be enhanced to include SKU
      price: cartItem.price,
      quantity: cartItem.quantity,
      imageUrl: cartItem.imageUrl || '',
      variantId: '',
      variantName: '',
      specifications: {}
    }));

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.99; // Match the value from checkout page
    const total = subtotal + deliveryFee;

    // Create order data matching Android app structure
    const orderData: Omit<Order, 'id' | 'orderNumber'> = {
      customerId: currentUser.uid,
      shopId: shopId,
      ownerId: shop.ownerId, // This is the KEY field that was missing!
      
      // Order Items
      items: orderItems,
      
      // Pricing
      subtotal,
      tax: 0.0,
      taxRate: 0.0,
      shippingFee: 0.0,
      deliveryFee,
      serviceFee: 0.0,
      discount: 0.0,
      discountCode: '',
      total,
      currency: 'USD',
      
      // Status
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      fulfillmentStatus: FulfillmentStatus.PENDING,
      
      // Customer Info
      customerInfo: {
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: ''
      } as CustomerInfo,
      
      // Shipping
      shippingMethod: ShippingMethod.DELIVERY,
      shippingAddress: {
        recipientName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        instructions: ''
      } as ShippingAddress,
      
      // Tracking
      trackingNumber: '',
      carrier: '',
      estimatedDelivery: 0,
      
      // Payment
      paymentMethod: 'Card',
      paymentReference: '',
      
      // Notes
      customerNotes: '',
      internalNotes: '',
      
      // Timestamps (handled by orderRepository)
      createdAt: 0,
      updatedAt: 0,
      confirmedAt: 0,
      shippedAt: 0,
      deliveredAt: 0,
      cancelledAt: 0
    };

    // Create the order
    const orderId = await orderRepository.createOrder(orderData);
    console.log('📦 Order created for shop', shopId, '- Order ID:', orderId);
    
    return orderId;
  }
}

export const checkoutService = CheckoutService.getInstance();