import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useAlert } from '@/hooks/useAlert';
import api from '@/config/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Laporan {
  id: number;
  title: string;
  description: string;
  tanggal_kejadian?: string;
  lokasi_kejadian?: string;
  instansi_tujuan?: string;
  category_id?: number;
}

export default function EditLaporanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState<Laporan>({
    id: 0,
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchLaporan();
    }
  }, [id]);

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/laporan/${id}`);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching laporan:', error);
      showAlert('Error', 'Gagal memuat laporan', () => {
        router.back();
      });
    } finally {
      setLoading(false);
    }
  };

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

    if (!formData.title.trim()) {
      newErrors.title = 'Judul wajib diisi';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await api.patch(`/laporan/${id}`, formData);
      showAlert('Berhasil', response.data.message || 'Laporan berhasil diperbarui', () => {
        router.back();
      });
    } catch (error: any) {
      console.error('Error updating laporan:', error);
      const errorMessage = error.response?.data?.error || 'Gagal memperbarui laporan';
      showAlert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Laporan</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <Input
            label="Judul Laporan"
            placeholder="Judul laporan Anda"
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
            error={errors.title}
          />

          <Input
            label="Deskripsi"
            placeholder="Jelaskan detail laporan Anda"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            error={errors.description}
          />

          <Input
            label="Tanggal Kejadian (Opsional)"
            placeholder="YYYY-MM-DD"
            value={formData.tanggal_kejadian || ''}
            onChangeText={(text) => handleChange('tanggal_kejadian', text)}
          />

          <Input
            label="Lokasi Kejadian (Opsional)"
            placeholder="Lokasi kejadian"
            value={formData.lokasi_kejadian || ''}
            onChangeText={(text) => handleChange('lokasi_kejadian', text)}
          />

          <Button
            onPress={handleSubmit}
            title="Simpan Perubahan"
            loading={saving}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    marginHorizontal: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
