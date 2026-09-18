import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set) => ({
  session: null,
  isLoading: false,
  error: null,

  requestOtpBackend: async (mobile) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.requestOtp(mobile);
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
        set({
          session: {
            mobile: res.user?.mobile || mobile,
            role: res.user?.role || 'buyer',
            token: res.token,
            user: res.user,
          },
          isLoading: false,
          error: null,
        });
        return res;
      } else {
        throw new Error(res.error || 'Invalid OTP');
      }
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  login: (mobile, role, token) =>
    set({
      session: { mobile, role: role || 'buyer', token },
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
