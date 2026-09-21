import { create } from 'zustand';
import { api } from '../services/api';

export const useCartStore = create((set, get) => ({
  items: [],
  localGuestItems: [], // Preserves local cart products when user is not logged in

  addItem: (product) =>
    set((state) => {
      const pId = product._id || product.id || 'prod';
      const bundle = product.selectedBundle || product.defaultBundle || product.bundle || {};
      const bundleId = bundle.bundleId || bundle._id || bundle.label || 'pack-1';
      const bundleLabel = bundle.label || product.size || 'Pack of 1';
      const cartItemId = product.cartItemId || `${pId}_${bundleId}`;

      const itemPrice = typeof bundle.price === 'number' ? bundle.price : (product.price || 0);
      const itemMrp = typeof bundle.mrp === 'number' ? bundle.mrp : (product.mrp || itemPrice);
      const addQty = product.quantity || 1;

      const existingIndex = state.items.findIndex(
        (item) => item.cartItemId === cartItemId
      );

      let nextItems = [];

      if (existingIndex > -1) {
        nextItems = state.items.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + addQty } : item
        );
      } else {
        const itemObj = {
          _id: pId,
          cartItemId,
          bundleId,
          productId: product.masterProductId || pId,
          variantId: product.variantId || 'default',
          name: product.name || 'Product',
          variantLabel: product.variantLabel || '',
          bundleLabel: bundleLabel,
          title: `${product.name} (${bundleLabel})`,
          price: itemPrice,
          mrp: itemMrp,
          quantity: addQty,
          image: bundle.image || product.image || product.img,
        };
        nextItems = [...state.items, itemObj];
      }

      return {
        items: nextItems,
        localGuestItems: nextItems,
      };
    }),

  removeItem: (cartItemId) =>
    set((state) => {
      const nextItems = state.items.filter(
        (item) => (item.cartItemId || item._id) !== cartItemId
      );
      return { items: nextItems, localGuestItems: nextItems };
    }),

  updateQuantity: (cartItemId, quantity) =>
    set((state) => {
      const nextItems = state.items
        .map((item) =>
          (item.cartItemId || item._id) === cartItemId
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
          product: i.productId || i.product?._id || i._id,
          productId: i.productId || i._id,
          variantId: i.variantId || 'default',
          bundleId: i.bundleId || 'pack-1',
          cartItemId: i.cartItemId,
          title: i.title || i.name,
          name: i.name,
          variantLabel: i.variantLabel,
          bundleLabel: i.bundleLabel,
          price: i.price,
          mrp: i.mrp,
          image: i.image,
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
