import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start — try to restore session from stored token
  useEffect(() => {
    authApi.getMe()
      .then((u) => setUser(u ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Login: verify PIN locally, then load user from stored token
  const login = async (email, pin) => {
    // 1. Check PIN stored on device
    const storedPin   = await SecureStore.getItemAsync('userPin');
    const storedEmail = await SecureStore.getItemAsync('userEmail');

    if (storedPin && storedEmail) {
      // Returning user — verify PIN locally
      if (pin !== storedPin) throw new Error('Invalid PIN');
      if (email.toLowerCase() !== storedEmail.toLowerCase()) throw new Error('Invalid email');
      // Load user profile from stored token
      const u = await authApi.getMe();
      if (!u) throw new Error('Session expired');
      setUser(u);
      return u;
    } else {
      // First time login — send to API, then save PIN + email locally
      const u = await authApi.login({ email, password: pin });
      await SecureStore.setItemAsync('userPin',   pin);
      await SecureStore.setItemAsync('userEmail', email.toLowerCase());
      setUser(u);
      return u;
    }
  };

  // Register: create account, save PIN + email locally
  const register = async (data) => {
    const u = await authApi.register(data);
    // Save PIN and email so user can log in locally next time
    const savedPin = await SecureStore.getItemAsync('userPin');
    if (savedPin) {
      await SecureStore.setItemAsync('userEmail', data.email.toLowerCase());
    }
    setUser(u);
    return u;
  };

  // Save PIN after PinSetup (called from PinConfirmScreen)
  const savePin = async (pin) => {
    await SecureStore.setItemAsync('userPin', pin);
    // Also save current user email so login can match it
    if (user?.email) {
      await SecureStore.setItemAsync('userEmail', user.email.toLowerCase());
    }
  };

  const logout = async () => {
    await authApi.logout();
    // Keep PIN and email on device — user should still be able to log back in
    setUser(null);
  };

  // Full logout — clears everything including PIN
  const logoutAndClearPin = async () => {
    await authApi.logout();
    await SecureStore.deleteItemAsync('userPin');
    await SecureStore.deleteItemAsync('userEmail');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout, logoutAndClearPin, savePin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}