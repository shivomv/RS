import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  session: null,
  isLoading: false,
  error: null,

  login: (mobile, role, token) =>
    set({
      session: { mobile, role, token },
      error: null,
    }),

  logout: () =>
    set({
      session: null,
      error: null,
    }),

  setSession: (session) =>
    set({ session }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),
}));
