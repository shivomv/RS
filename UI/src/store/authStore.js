import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const SESSION_KEY = 'rs_auth_session';

export const useAuthStore = create((set, get) => ({
  session: null,
  isLoading: false,
  error: null,
  initialized: false,

  // Initialize auth from AsyncStorage
  initializeAuth: async () => {
    try {
      const savedSession = await AsyncStorage.getItem(SESSION_KEY);
      if (savedSession) {
        set({ session: JSON.parse(savedSession), initialized: true });
      } else {
        set({ initialized: true });
      }
    } catch (err) {
      console.error('[Auth] Init error:', err.message);
      set({ initialized: true });
    }
  },

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

  directLogin: async (mobile, name, shopName) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.directLogin({ mobile, name, shopName });
      if (res.success && res.token) {
        const userObj = res.user;
        const newSession = {
          mobile: userObj?.mobile || mobile,
          role: userObj?.role || 'buyer',
          token: res.token,
          user: userObj,
        };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        set({ session: newSession, isLoading: false, error: null });
        return res;
      } else {
        throw new Error(res.error || 'Authentication failed');
      }
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  googleLogin: async (googleData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.googleLogin(googleData);
      if (res.success && res.token) {
        const userObj = res.user;
        const newSession = {
          mobile: userObj?.mobile || googleData.mobile || '',
          role: userObj?.role || 'buyer',
          token: res.token,
          user: userObj,
        };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        set({ session: newSession, isLoading: false, error: null });
        return res;
      }
      set({ isLoading: false });
      return res;
    } catch (err) {
      set({ isLoading: false, error: err.message });
      throw err;
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const currentSession = get().session || {};
      const userId = currentSession?.user?._id || currentSession?.user?.id;
      const res = await api.updateProfile({ ...profileData, userId, id: userId });
      if (res.success && res.user) {
        const userObj = res.user;
        const currentSession = get().session || {};
        const updatedSession = {
          ...currentSession,
          mobile: userObj.mobile || currentSession.mobile || '',
          user: { ...currentSession.user, ...userObj },
        };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
        set({ session: updatedSession, isLoading: false, error: null });
        return res;
      }
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
        
        // Save to AsyncStorage
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        
        set({
          session: newSession,
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

  login: async (mobile, role, token) => {
    const newSession = { mobile, role: role || 'buyer', token, user: { mobile, role: role || 'buyer' } };
    
    // Save to AsyncStorage
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    
    set({
      session: newSession,
      error: null,
    });
  },

  logout: async () => {
    // Clear from AsyncStorage
    await AsyncStorage.removeItem(SESSION_KEY);
    
    set({
      session: null,
      error: null,
    });
  },

  setSession: (session) =>
    set({ session }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setError: (error) =>
    set({ error }),
}));
