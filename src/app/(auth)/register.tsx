'use client';
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAlert } from '@/hooks/useAlert';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, user, loading: authLoading } = useAuth();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    nik: '',
    nama_lengkap: '',
    email: '',
    password: '',
    confirmPassword: '',
    alamat: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect ke home jika sudah login
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/(tabs)/home');
    }
  }, [user, authLoading, router]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nik.trim()) {
      newErrors.nik = 'NIK wajib diisi';
    } else if (!/^\d{16}$/.test(formData.nik)) {
      newErrors.nik = 'NIK harus 16 digit angka';
    }

    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = 'Nama lengkap wajib diisi';
    } else if (formData.nama_lengkap.trim().length < 5) {
      newErrors.nama_lengkap = 'Nama lengkap minimal 5 karakter';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.alamat.trim()) {
      newErrors.alamat = 'Alamat wajib diisi';
    } else if (formData.alamat.trim().length < 10) {
      newErrors.alamat = 'Alamat minimal 10 karakter';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await register(
      formData.nik,
      formData.nama_lengkap,
      formData.email,
      formData.password,
      formData.alamat
    );
    setLoading(false);

    if (result.success) {
      showAlert('Register Berhasil', result.message || 'Silakan login dengan akun Anda', () => {
        router.push('/(auth)/login');
      });
    } else {
      showAlert('Register Gagal', result.message || 'Terjadi kesalahan');
    }
  };

  const handleNavigateToLogin = () => {
    router.push('/(auth)/login');
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <View style={styles.logoCircle}>
                <View style={styles.logoText}>📢</View>
              </View>
            </View>
            <View style={styles.titleText}>
              <View style={styles.titleLine}>Daftar Akun Baru</View>
              <View style={styles.subtitle}>
                Bergabunglah dengan kami dan mulai laporkan masalah di sekitarmu
              </View>
            </View>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="NIK (16 digit)"
              placeholder="Masukkan NIK Anda"
              keyboardType="numeric"
              maxLength={16}
              value={formData.nik}
              onChangeText={(text) => handleChange('nik', text)}
              error={errors.nik}
            />

            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap Anda"
              value={formData.nama_lengkap}
              onChangeText={(text) => handleChange('nama_lengkap', text)}
              error={errors.nama_lengkap}
            />

            <Input
              label="Email"
              placeholder="Masukkan email Anda"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              error={errors.email}
            />

            <Input
              label="Alamat"
              placeholder="Masukkan alamat Anda (minimal 10 karakter)"
              multiline
              numberOfLines={3}
              value={formData.alamat}
              onChangeText={(text) => handleChange('alamat', text)}
              error={errors.alamat}
            />

            <Input
              label="Password"
              placeholder="Masukkan password (minimal 6 karakter)"
              isPassword
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              error={errors.password}
            />

            <Input
              label="Konfirmasi Password"
              placeholder="Ulangi password Anda"
              isPassword
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              error={errors.confirmPassword}
            />

            <Button
              onPress={handleSubmit}
              title="Daftar"
              loading={loading}
              style={styles.registerButton}
            />

            <View style={styles.loginLink}>
              <View style={styles.loginText}>Sudah punya akun?</View>
              <Button
                onPress={handleNavigateToLogin}
                title="Masuk di sini"
                variant="secondary"
                size="small"
                style={styles.loginButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 32,
  },
  logo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
  },
  titleText: {
    gap: 8,
  },
  titleLine: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  registerButton: {
    marginTop: 8,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  loginButton: {
    width: '100%',
  },
});
