import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/config/api';

interface User {
  id: number;
  nik: string;
  nama_lengkap: string;
  email: string;
  alamat: string;
  role: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    nik: string,
    nama_lengkap: string,
    email: string,
    password: string,
    alamat: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize user dari AsyncStorage saat app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');

        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      if (!token || !userData) {
        return { success: false, message: 'Data tidak lengkap' };
      }

      // Simpan token dan user data
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Login gagal';
      return { success: false, message: errorMessage };
    }
  };

  const register = async (
    nik: string,
    nama_lengkap: string,
    email: string,
    password: string,
    alamat: string
  ) => {
    try {
      const response = await api.post('/auth/register', {
        nik,
        nama_lengkap,
        email,
        password,
        alamat,
      });

      return { success: true, message: response.data.message };
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Register gagal';
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider');
  }
  return context;
};
