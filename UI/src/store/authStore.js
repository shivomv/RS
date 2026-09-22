import { create } from 'zustand';
import { api } from '../services/api';
import { useCartStore } from './cartStore';

export const useAuthStore = create((set) => ({
  session: null,
  isLoading: false,
  error: null,

  requestOtpBackend: async (mobile, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.requestOtp(mobile, name);
      set({ isLoading: false });
      return res;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  verifyOtpBackend: async (mobile, otp) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.verifyOtp(mobile, otp);
      if (res.success) {
        const userObj = res.user;
        const newSession = {
          mobile: userObj?.mobile || mobile,
          role: userObj?.role || 'buyer',
          token: res.token,
          user: userObj,
        };
        set({
          session: newSession,
          isLoading: false,
          error: null,
        });

        // Trigger instant cart sync & clear local guest cart
        const userId = userObj?._id || userObj?.id || mobile;
        useCartStore.getState().syncGuestCartOnLogin(userId);

        return res;
      } else {
        throw new Error(res.error || 'Invalid OTP');
      }
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  login: (mobile, role, token) => {
    const newSession = { mobile, role: role || 'buyer', token, user: { mobile, role: role || 'buyer' } };
    set({
      session: newSession,
      error: null,
    });
    // Trigger instant cart sync & clear local guest cart
    useCartStore.getState().syncGuestCartOnLogin(mobile);
  },

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
