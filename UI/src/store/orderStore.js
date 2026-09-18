import { create } from 'zustand';
import { api } from '../services/api';

export const useOrderStore = create((set) => ({
  orders: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getOrders();
      set({ orders: Array.isArray(data) ? data : [], isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },

  setOrders: (orders) =>
    set({ orders, error: null }),

  addOrder: async (order) => {
    set({ isLoading: true });
    try {
      const created = await api.createOrder(order);
      set((state) => ({
        orders: [created, ...state.orders],
        isLoading: false,
      }));
      return created;
    } catch (err) {
      set((state) => ({
        orders: [order, ...state.orders],
        isLoading: false,
      }));
      return order;
    }
  },

  updateOrder: (id, order) =>
    set((state) => ({
      orders: state.orders.map((o) => (o._id === id || o.orderId === id ? order : o)),
    })),

  updateOrderStatus: async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
    } catch (err) {}
    set((state) => ({
      orders: state.orders.map((o) =>
        o._id === id || o.orderId === id ? { ...o, status } : o
      ),
    }));
  },

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),
}));
