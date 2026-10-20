import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { adminApi } from '../services/api';
import { getFCMToken, registerDeviceToken } from '../services/notificationService';

let globalSession = {
  isAuthenticated: false,
  user: null,
};

let listeners = [];

export function useAdminAuth() {
  const [session, setSession] = useState(globalSession);

  useEffect(() => {
    listeners.push(setSession);
    return () => {
      listeners = listeners.filter((l) => l !== setSession);
    };
  }, []);

  const login = async (mobile, pin) => {
    try {
      const cleanMobile = mobile ? mobile.trim() : '';
      const cleanPin = pin ? pin.trim() : '';

      // 1. Retrieve real FCM token (requests permission if needed)
      let deviceToken = null;
      try {
        deviceToken = await getFCMToken();
        console.log('[AdminAuth] Retrieved FCM token for login:', deviceToken ? `${deviceToken.substring(0, 15)}...` : 'none');
      } catch (err) {
        console.warn('[AdminAuth] Error fetching device token on login:', err.message);
      }

      // 2. Authenticate against database and auto-register token
      const res = await adminApi.loginAdmin({
        mobile: cleanMobile,
        pin: cleanPin,
        deviceToken: deviceToken || null,
        deviceModel: `${Platform.OS} API ${Platform.Version}`,
      });

      if (res && res.success && res.user) {
        const newSession = {
          isAuthenticated: true,
          user: res.user,
        };
        globalSession = newSession;
        listeners.forEach((l) => l(newSession));

        // 3. Guarantee registration with admin's mobile number
        registerDeviceToken(cleanMobile).catch((err) => {
          console.warn('[AdminAuth] Post-login device registration error:', err.message);
        });

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

      // Delete device record on backend on logout
      await adminApi.unregisterDeviceToken({
        token: deviceToken || undefined,
        adminIdentifier: currentMobile || undefined,
      }).catch((err) => {
        console.warn('[AdminAuth] Unregister device error on logout:', err.message);
      });
    } catch (_) {}

    const newSession = { isAuthenticated: false, user: null };
    globalSession = newSession;
    listeners.forEach((l) => l(newSession));
  };

  return { session, login, logout };
}
