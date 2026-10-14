import { useState, useEffect } from 'react';

// Persistent Admin Authentication Session State
// Stays logged in permanently until user explicitly taps "Logout"
let globalSession = {
  isAuthenticated: true,
  user: {
    name: 'RS Admin Director',
    mobile: '9876543210',
    role: 'ADMIN',
  },
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

  const login = (mobile, pin) => {
    // Validates Admin credentials (default PIN: 9999 or 12345 or 0000)
    if (pin === '9999' || pin === '12345' || pin === '0000') {
      const newSession = {
        isAuthenticated: true,
        user: {
          name: 'RS Admin Director',
          mobile: mobile || '9876543210',
          role: 'ADMIN',
        },
      };
      globalSession = newSession;
      listeners.forEach((l) => l(newSession));
      return { success: true };
    }
    return { success: false, error: 'Invalid Admin PIN. (Use PIN 9999 or 12345)' };
  };

  const logout = () => {
    // Explicit manual logout only
    const newSession = { isAuthenticated: false, user: null };
    globalSession = newSession;
    listeners.forEach((l) => l(newSession));
  };

  return { session, login, logout };
}
