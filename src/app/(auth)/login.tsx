'use client';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect ke home jika sudah login
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/(tabs)/home');
    }
  }, [user, authLoading, router]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      showAlert('Login Gagal', result.message || 'Terjadi kesalahan');
    }
  };

  const handleNavigateToRegister = () => {
    router.push('/(auth)/register');
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
                <Text style={styles.logoText}>📢</Text>
              </View>
            </View>
            <View style={styles.title}>
              <View style={styles.titleText}>
                <View style={styles.titleLine1}>
                  <Text style={styles.wordSuara}>Suara</Text>
                </View>
                <View style={styles.titleLine2}>
                  <Text style={styles.wordRakyat}>Rakyat,</Text>
                </View>
                <View style={styles.titleLine3}>
                  <Text style={styles.wordAksi}>Aksi</Text>
                </View>
                <Text style={styles.titleLine4}>Nyata.</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>
              Masuk dan lanjutkan perjuanganmu. Setiap laporan adalah satu langkah nyata menuju perubahan yang lebih baik.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="Masukkan email Anda"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
            />

            <Input
              label="Password"
              placeholder="Masukkan password Anda"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              isPassword
              error={errors.password}
            />

            <Button
              onPress={handleSubmit}
              title="Masuk"
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.registerLink}>
              <Text style={styles.registerText}> Belum punya akun?</Text>
              <Button
                onPress={handleNavigateToRegister}
                title="Daftar di sini"
                variant="secondary"
                size="small"
                style={styles.registerButton}
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
  title: {
    marginBottom: 16,
  },
  titleText: {
    gap: 0,
  },
  titleLine1: {
    flexDirection: 'row',
  },
  wordSuara: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
  },
  titleLine2: {
    flexDirection: 'row',
  },
  wordRakyat: {
    fontSize: 32,
    fontWeight: '900',
    color: '#60A5FA',
  },
  titleLine3: {
    flexDirection: 'row',
  },
  wordAksi: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
  },
  titleLine4: {
    fontSize: 32,
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
  loginButton: {
    marginTop: 8,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  registerButton: {
    width: '100%',
  },
});
