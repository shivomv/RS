import { create } from 'zustand';
import { api } from '../services/api';

export const useShopkeeperStore = create((set) => ({
  shopkeeper: null,
  shopkeepers: [],
  isLoading: false,
  error: null,

  fetchShopkeepers: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getShopkeepers();
      set({ shopkeepers: Array.isArray(data) ? data : [], isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  addShopkeeper: async (data) => {
    set({ isLoading: true });
    try {
      const created = await api.createShopkeeper(data);
      set((state) => ({
        shopkeepers: [created, ...state.shopkeepers],
        isLoading: false,
      }));
      return created;
    } catch (err) {
      set((state) => ({
        shopkeepers: [data, ...state.shopkeepers],
        isLoading: false,
      }));
      return data;
    }
  },

  setShopkeeper: (shopkeeper) =>
    set({ shopkeeper, error: null }),

  updateShopkeeper: (data) =>
    set((state) => ({
      shopkeeper: state.shopkeeper ? { ...state.shopkeeper, ...data } : null,
    })),

  clearShopkeeper: () =>
    set({ shopkeeper: null }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),
}));
