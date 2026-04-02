import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getMe()
      .then((u) => setUser(u ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, pin) => {
    const storedPin   = await SecureStore.getItemAsync('userPin');
    const storedEmail = await SecureStore.getItemAsync('userEmail');

    if (storedPin && storedEmail) {
      // Returning user — verify PIN locally first
      if (pin !== storedPin) throw new Error('Invalid PIN');
      if (email.trim().toLowerCase() !== storedEmail.trim().toLowerCase()) {
        throw new Error('Invalid email');
      }
      // Token still valid? Use it
      const u = await authApi.getMe();
      if (u) { setUser(u); return u; }
      // Token expired — re-authenticate with API using PIN as password
      const fresh = await authApi.login({ email, password: pin });
      setUser(fresh);
      return fresh;
    } else {
      // First login on this device — hit API, PIN is the password
      const u = await authApi.login({ email, password: pin });
      await SecureStore.setItemAsync('userPin',   pin);
      await SecureStore.setItemAsync('userEmail', email.trim().toLowerCase());
      setUser(u);
      return u;
    }
  };

  // Called from RegisterScreen BEFORE navigating to PinSetup
  // Stores email so savePin can use it later
  const register = async (data) => {
    // data.password will be set to the PIN by RegisterScreen after PIN is chosen
    const u = await authApi.register(data);
    await SecureStore.setItemAsync('userEmail', data.email.trim().toLowerCase());
    // Save PIN — data.password IS the PIN
    if (data.password && data.password !== 'pin-auth') {
      await SecureStore.setItemAsync('userPin', data.password);
    }
    setUser(u);
    return u;
  };

  // Called from PinConfirmScreen once PIN is confirmed
  const savePin = async (pin) => {
    await SecureStore.setItemAsync('userPin', pin);
    const email = user?.email ?? await SecureStore.getItemAsync('userEmail');
    if (email) {
      await SecureStore.setItemAsync('userEmail', email.trim().toLowerCase());
    }
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

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