import { create } from 'zustand';

export const useShopkeeperStore = create((set) => ({
  shopkeeper: null,
  isLoading: false,
  error: null,

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
