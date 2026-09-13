import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  items: [],

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((item) => item.product._id === product._id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { product, quantity: 1 }],
      };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((item) => item.product._id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.product._id === productId
          ? { ...item, quantity: Math.max(0, quantity) }
          : item
      ),
    })),

  clearCart: () => set({ items: [] }),

  itemCount: () => get().items.length,

  totalAmount: () =>
    get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
}));
