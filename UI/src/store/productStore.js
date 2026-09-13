import { create } from 'zustand';

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  setProducts: (products) =>
    set({ products, error: null }),

  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  updateProduct: (id, product) =>
    set((state) => ({
      products: state.products.map((p) => (p._id === id || p.id === id ? product : p)),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p._id !== id && p.id !== id),
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),
}));
