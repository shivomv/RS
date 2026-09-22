import { create } from 'zustand';
import { api } from '../services/api';
import { useAuthStore } from './authStore';

export const useCartStore = create((set, get) => ({
  items: [],

  // Load cart from backend
  loadCart: async (shopkeeperId) => {
    try {
      const res = await api.getCart(shopkeeperId);
      if (res.success && res.data?.items) {
        set({ items: res.data.items });
      }
    } catch (err) {
      console.error('[Cart] Load error:', err.message);
    }
  },

  addItem: (product) =>
    set(async (state) => {
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

      // Sync to database if user is logged in
      const { session } = useAuthStore.getState();
      if (session?.user?._id) {
        try {
          const payloadItems = nextItems.map((i) => ({
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
          
          await api.syncCart(session.user._id, payloadItems);
          // Reload cart from backend to ensure sync
          await get().loadCart(session.user._id);
        } catch (err) {
          console.error('[Cart] Sync error:', err.message);
        }
      }

      return { items: nextItems };
    }),

  removeItem: (cartItemId) =>
    set(async (state) => {
      const nextItems = state.items.filter(
        (item) => (item.cartItemId || item._id) !== cartItemId
      );

      // Sync to database if user is logged in
      const { session } = useAuthStore.getState();
      if (session?.user?._id) {
        try {
          const payloadItems = nextItems.map((i) => ({
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
          
          await api.syncCart(session.user._id, payloadItems);
          // Reload cart from backend to ensure sync
          await get().loadCart(session.user._id);
        } catch (err) {
          console.error('[Cart] Sync error:', err.message);
        }
      }

      return { items: nextItems };
    }),

  updateQuantity: (cartItemId, quantity) =>
    set(async (state) => {
      const nextItems = state.items
        .map((item) =>
          (item.cartItemId || item._id) === cartItemId
            ? { ...item, quantity: Math.max(0, quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      // Sync to database if user is logged in
      const { session } = useAuthStore.getState();
      if (session?.user?._id) {
        try {
          const payloadItems = nextItems.map((i) => ({
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
          
          await api.syncCart(session.user._id, payloadItems);
          // Reload cart from backend to ensure sync
          await get().loadCart(session.user._id);
        } catch (err) {
          console.error('[Cart] Sync error:', err.message);
        }
      }

      return { items: nextItems };
    }),

  clearCart: () => set({ items: [] }),

  itemCount: () => get().items.length,

  totalAmount: () =>
    get().items.reduce((sum, item) => {
      const price = item.price || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0),
}));
