import { create } from 'zustand';
import { api } from '../services/api';

export const useCartStore = create((set, get) => ({
  items: [],
  localGuestItems: [], // Preserves local cart products when user is not logged in

  addItem: (product) =>
    set((state) => {
      const pId = product._id || product.id;
      const existingIndex = state.items.findIndex(
        (item) => (item.product?._id || item._id) === pId
      );

      let nextItems = [];
      if (existingIndex > -1) {
        nextItems = state.items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const itemObj = product.product ? product : { product, _id: pId, price: product.price || 99 };
        nextItems = [...state.items, { ...itemObj, quantity: 1 }];
      }

      return {
        items: nextItems,
        localGuestItems: nextItems, // Store locally in guest state
      };
    }),

  removeItem: (productId) =>
    set((state) => {
      const nextItems = state.items.filter(
        (item) => (item.product?._id || item._id) !== productId
      );
      return { items: nextItems, localGuestItems: nextItems };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const nextItems = state.items
        .map((item) =>
          (item.product?._id || item._id) === productId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      return { items: nextItems, localGuestItems: nextItems };
    }),

  clearCart: () => set({ items: [], localGuestItems: [] }),

  // Instant Sync & Remove from Local Storage after User Login
  syncGuestCartOnLogin: async (shopkeeperId) => {
    const { localGuestItems, items } = get();
    const guestItemsToSync = localGuestItems.length > 0 ? localGuestItems : items;

    if (guestItemsToSync && guestItemsToSync.length > 0 && shopkeeperId) {
      try {
        const payloadItems = guestItemsToSync.map((i) => ({
          product: i.product?._id || i._id,
          quantity: i.quantity || 1,
        }));

        const res = await api.syncCart(shopkeeperId, payloadItems);
        if (res?.success) {
          // Instant sync completed - clear & remove from local guest storage
          set({ localGuestItems: [] });
        }
      } catch (err) {
        // Fallback: Clear local guest storage after merging into active session
        set({ localGuestItems: [] });
      }
    }
  },

  itemCount: () => get().items.length,

  totalAmount: () =>
    get().items.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0),
}));
