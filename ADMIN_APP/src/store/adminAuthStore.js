import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminApi, setAdminAuthToken } from '../services/api';
import { getFCMToken, registerDeviceToken } from '../services/notificationService';

const ADMIN_SESSION_KEY = 'rs_admin_session_v1';

let globalSession = {
  isAuthenticated: false,
  user: null,
  token: null,
  initialized: false,
};

let listeners = [];

let isRestoring = false;

async function restoreSession() {
  if (isRestoring || globalSession.initialized) return;
  isRestoring = true;
  try {
    const raw = await AsyncStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.user) {
        setAdminAuthToken(parsed.token);
        globalSession = {
          isAuthenticated: true,
          user: parsed.user,
          token: parsed.token,
          initialized: true,
        };
        listeners.forEach((l) => l(globalSession));
        return;
      }
    }
  } catch (e) {
    console.warn('[AdminAuth] Error restoring session:', e.message);
  } finally {
    isRestoring = false;
    if (!globalSession.initialized) {
      globalSession = { ...globalSession, initialized: true };
      listeners.forEach((l) => l(globalSession));
    }
  }
}

// Trigger initial restore
restoreSession();

export function useAdminAuth() {
  const [session, setSession] = useState(globalSession);

  useEffect(() => {
    listeners.push(setSession);
    setSession(globalSession);

    if (!globalSession.initialized) {
      restoreSession();
    }

    return () => {
      listeners = listeners.filter((l) => l !== setSession);
    };
  }, []);

  const loginGoogle = async (googleProfile) => {
    try {
      let deviceToken = null;
      try {
        deviceToken = await getFCMToken();
      } catch (_) {}

      const res = await adminApi.loginAdminGoogle({
        email: googleProfile.email,
        name: googleProfile.name,
        googleId: googleProfile.googleId,
        deviceToken: deviceToken || null,
        deviceModel: `${Platform.OS} API ${Platform.Version}`,
      });

      if (res && res.success && res.user) {
        if (res.token) {
          setAdminAuthToken(res.token);
        }

        const newSession = {
          isAuthenticated: true,
          user: res.user,
          token: res.token || null,
          initialized: true,
        };
        globalSession = newSession;
        listeners.forEach((l) => l(newSession));

        await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(newSession));

        if (res.user.mobile || googleProfile.email) {
          registerDeviceToken(res.user.mobile || googleProfile.email).catch(() => {});
        }

        return { success: true, user: res.user };
      }

      return { success: false, error: res?.error || 'Google admin authentication failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Network error during Google login' };
    }
  };

  const login = async (mobile, pin) => {
    try {
      const cleanMobile = mobile ? mobile.trim() : '';
      const cleanPin = pin ? pin.trim() : '';

      let deviceToken = null;
      try {
        deviceToken = await getFCMToken();
      } catch (err) {
        console.warn('[AdminAuth] Error fetching device token on login:', err.message);
      }

      const res = await adminApi.loginAdmin({
        mobile: cleanMobile,
        pin: cleanPin,
        deviceToken: deviceToken || null,
        deviceModel: `${Platform.OS} API ${Platform.Version}`,
      });

      if (res && res.success && res.user) {
        if (res.token) {
          setAdminAuthToken(res.token);
        }

        const newSession = {
          isAuthenticated: true,
          user: res.user,
          token: res.token || null,
          initialized: true,
        };
        globalSession = newSession;
        listeners.forEach((l) => l(newSession));

        await AsyncStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(newSession));

        registerDeviceToken(cleanMobile).catch(() => {});

        return { success: true, user: res.user };
      }

      return { success: false, error: res?.error || 'Authentication failed' };
    } catch (err) {
      return { success: false, error: err.message || 'Login network error' };
    }
  };

  const logout = async () => {
    try {
      const currentMobile = globalSession?.user?.mobile;
      let deviceToken = null;
      try {
        deviceToken = await getFCMToken();
      } catch (_) {}

      await adminApi.unregisterDeviceToken({
        token: deviceToken || undefined,
        adminIdentifier: currentMobile || undefined,
      }).catch(() => {});

      await AsyncStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (_) {}

    setAdminAuthToken(null);
    const newSession = { isAuthenticated: false, user: null, token: null, initialized: true };
    globalSession = newSession;
    listeners.forEach((l) => l(newSession));
  };

  return { session, login, loginGoogle, logout };
}
