'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { useAuthStore } from '@/lib/store/auth';
import { orderRepository } from '@/lib/firebase/repositories/orderRepository';
import { OrderStatus, PaymentStatus, Order, FulfillmentStatus, ShippingMethod } from '@/types/order';
import { shopRepository } from '@/lib/firebase/repositories';

export function useCartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, totalAmount, totalItems, removeItem, updateQuantity, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequestOrder = async () => {
    if (!user || items.length === 0) return;

    setIsSubmitting(true);
    try {
      const itemsByShop = items.reduce((acc, item) => {
        if (!acc[item.shopId]) {
          acc[item.shopId] = [];
        }
        acc[item.shopId].push(item);
        return acc;
      }, {} as Record<string, typeof items>);

      for (const [shopId, shopItems] of Object.entries(itemsByShop)) {
        const shop = await shopRepository.getShopById(shopId);
        if (!shop) {
          console.error(`Shop with id ${shopId} not found`);
          continue;
        }

        const subtotal = shopItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const orderData: Omit<Order, 'id' | 'orderNumber'> = {
          customerId: user.id,
          shopId,
          ownerId: shop.ownerId,
          items: shopItems.map(item => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku || '',
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl || '',
            variantId: item.variantId || '',
            variantName: item.variantName || '',
            specifications: {}
          })),
          subtotal: subtotal,
          tax: 0,
          taxRate: 0,
          shippingFee: 0,
          deliveryFee: 0,
          serviceFee: 0,
          discount: 0,
          discountCode: '',
          total: subtotal, // Assuming total is same as subtotal for now
          currency: 'ZAR',
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          fulfillmentStatus: FulfillmentStatus.PENDING,
          customerInfo: {
            name: user.displayName || user.email || 'N/A',
            email: user.email || 'N/A',
            phone: user.profile?.phone || ''
          },
          shippingMethod: ShippingMethod.PICKUP,
          shippingAddress: {
            recipientName: '', street: '', city: '', state: '', zipCode: '', country: '', phone: '', instructions: ''
          },
          trackingNumber: '',
          carrier: '',
          estimatedDelivery: 0,
          paymentMethod: '',
          paymentReference: '',
          customerNotes: message,
          internalNotes: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          confirmedAt: 0,
          shippedAt: 0,
          deliveredAt: 0,
          cancelledAt: 0,
        };

        await orderRepository.createOrder(orderData);
      }

      clearCart();
      setMessage('');
      router.push('/orders');
      
    } catch (error) {
      console.error('Failed to submit order request:', error);
      alert('Failed to submit order request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    router,
    user,
    items,
    totalAmount,
    totalItems,
    removeItem,
    updateQuantity,
    isSubmitting,
    message,
    setMessage,
    handleRequestOrder,
  };
}
