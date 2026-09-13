import { create } from 'zustand';

export const useOrderStore = create((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  setOrders: (orders) =>
    set({ orders, error: null }),

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  updateOrder: (id, order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o._id === id ? order : o)),
    })),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),
}));
