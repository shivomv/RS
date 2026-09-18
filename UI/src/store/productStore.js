import { create } from 'zustand';
import { api } from '../services/api';

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getProducts();
      set({ products: Array.isArray(data) ? data : [], isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  setProducts: (products) =>
    set({ products, error: null }),

  addProduct: async (product) => {
    set({ isLoading: true });
    try {
      const created = await api.createProduct(product);
      set((state) => ({
        products: [created, ...state.products],
        isLoading: false,
      }));
      return created;
    } catch (err) {
      set((state) => ({
        products: [product, ...state.products],
        isLoading: false,
      }));
    }
  },

  updateProduct: (id, product) =>
    set((state) => ({
      products: state.products.map((p) => (p._id === id || p.id === id ? product : p)),
    })),

  deleteProduct: async (id) => {
    try {
      await api.deleteProduct(id);
    } catch (err) {}
    set((state) => ({
      products: state.products.filter((p) => p._id !== id && p.id !== id),
    }));
  },

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),
}));
