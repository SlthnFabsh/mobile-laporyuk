import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Tidak set default Content-Type di sini agar FormData bisa auto-detect
});

/**
 * Helper: deteksi apakah data adalah FormData.
 * Di React Native, `instanceof FormData` bisa gagal karena RN punya FormData sendiri.
 * Cek via constructor name sebagai fallback yang lebih aman.
 */
function isFormData(data: any): boolean {
  if (!data) return false;
  if (typeof FormData !== 'undefined' && data instanceof FormData) return true;
  // Fallback untuk React Native
  if (data && data.constructor && data.constructor.name === 'FormData') return true;
  // Cek _parts (internal React Native FormData)
  if (data && typeof data._parts !== 'undefined') return true;
  return false;
}

// Request interceptor untuk menambahkan token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (isFormData(config.data)) {
        // ✅ Untuk FormData (multipart): hapus Content-Type agar Axios/RN
        // bisa auto-set dengan boundary yang benar.
        // Harus hapus dari semua level agar tidak ada yang override.
        delete config.headers['Content-Type'];
        delete (config.headers as any)['content-type'];
        if (config.headers.common) {
          delete (config.headers.common as any)['Content-Type'];
        }
        if (config.headers.post) {
          delete (config.headers.post as any)['Content-Type'];
        }
      } else {
        // ✅ Untuk request JSON biasa
        config.headers['Content-Type'] = 'application/json';
      }
    } catch (error) {
      console.error('Error getting token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor untuk handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid, clear storage
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return '';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('file://') ||
    imagePath.startsWith('content://')
  ) {
    return imagePath;
  }
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export default api;
