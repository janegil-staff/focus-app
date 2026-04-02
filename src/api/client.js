import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://localhost:3000'; // change to your DO URL

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Inject token
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      isRefreshing = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        await SecureStore.setItemAsync('token', accessToken);
        await SecureStore.setItemAsync('refreshToken', newRefresh);
        queue.forEach((p) => p.resolve(accessToken));
        queue = [];
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch (e) {
        queue.forEach((p) => p.reject(e));
        queue = [];
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('refreshToken');
        throw e;
      } finally {
        isRefreshing = false;
      }
    }
    throw error;
  }
);

export const saveTokens = async (token, refreshToken) => {
  await SecureStore.setItemAsync('token', token);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('refreshToken');
};

export const getToken = () => SecureStore.getItemAsync('token');

export default api;
