import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartItem } from '@/types';

interface CartState extends Cart {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      totalItems: 0,
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === newItem.productId
          );

          let updatedItems;
          if (existingItem) {
            updatedItems = state.items.map((item) =>
              item.productId === newItem.productId
                ? { ...item, quantity: item.quantity + newItem.quantity }
                : item
            );
          } else {
            updatedItems = [...state.items, newItem];
          }

          const newState = { ...state, items: updatedItems };
          get().calculateTotals();
          return newState;
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const updatedItems = state.items.filter(
            (item) => item.productId !== productId
          );
          const newState = { ...state, items: updatedItems };
          get().calculateTotals();
          return newState;
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          );
          const newState = { ...state, items: updatedItems };
          get().calculateTotals();
          return newState;
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalAmount: 0,
          totalItems: 0,
        });
      },

      calculateTotals: () => {
        const state = get();
        const totalAmount = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        set({ totalAmount, totalItems });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
