import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import { useAlert } from '@/hooks/useAlert';
import api from '@/config/api';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Category {
  id: number;
  name: string;
}

interface Institution {
  id: number;
  name: string;
}

export default function CreateLaporanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedImages, addImage, removeImage, clearImages } = useImagePicker();
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tanggal_kejadian: '',
    lokasi_kejadian: '',
    instansi_tujuan: '',
    category_id: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [catRes, instRes] = await Promise.all([
          api.get('/categories'),
          api.get('/institutions'),
        ]);
        setCategories(catRes.data || []);
        setInstitutions(instRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showAlert('Error', 'Gagal memuat kategori dan institusi');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

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

    if (selectedImages.length === 0) {
      newErrors.images = 'Minimal satu foto wajib ditambahkan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.tanggal_kejadian) {
        formDataToSend.append('tanggal_kejadian', formData.tanggal_kejadian);
      }
      if (formData.lokasi_kejadian) {
        formDataToSend.append('lokasi_kejadian', formData.lokasi_kejadian);
      }
      if (formData.instansi_tujuan) {
        formDataToSend.append('instansi_tujuan', formData.instansi_tujuan);
      }
      if (formData.category_id) {
        formDataToSend.append('category_id', formData.category_id);
      }

      // Add images
      selectedImages.forEach((image, index) => {
        formDataToSend.append('files', {
          uri: image.uri,
          type: 'image/jpeg',
          name: image.name,
        } as any);
      });

      const response = await api.post('/laporan', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      showAlert('Berhasil', response.data.message || 'Laporan berhasil dibuat', () => {
        clearImages();
        router.replace('/(tabs)/home');
      });
    } catch (error: any) {
      console.error('Error creating laporan:', error);
      const errorMessage = error.response?.data?.error || 'Gagal membuat laporan';
      showAlert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Buat Laporan Baru</Text>
          </View>

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
              value={formData.tanggal_kejadian}
              onChangeText={(text) => handleChange('tanggal_kejadian', text)}
            />

            <Input
              label="Lokasi Kejadian (Opsional)"
              placeholder="Lokasi kejadian"
              value={formData.lokasi_kejadian}
              onChangeText={(text) => handleChange('lokasi_kejadian', text)}
            />

            {categories.length > 0 && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Kategori (Opsional)</Text>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        formData.category_id === item.id.toString() && styles.categoryButtonActive,
                      ]}
                      onPress={() => handleChange('category_id', item.id.toString())}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          formData.category_id === item.id.toString() && styles.categoryButtonTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  horizontal
                  scrollEnabled={true}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            {institutions.length > 0 && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Institusi Tujuan (Opsional)</Text>
                <FlatList
                  data={institutions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.institutionButton,
                        formData.instansi_tujuan === item.id.toString() && styles.institutionButtonActive,
                      ]}
                      onPress={() => handleChange('instansi_tujuan', item.id.toString())}
                    >
                      <Text
                        style={[
                          styles.institutionButtonText,
                          formData.instansi_tujuan === item.id.toString() && styles.institutionButtonTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                  horizontal
                  scrollEnabled={true}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Foto Laporan {selectedImages.length > 0 && `(${selectedImages.length})`}</Text>
              <Button
                onPress={addImage}
                title={selectedImages.length === 0 ? 'Tambah Foto' : 'Tambah Foto Lagi'}
                variant="secondary"
              />
              {errors.images && <Text style={styles.error}>{errors.images}</Text>}

              {selectedImages.length > 0 && (
                <FlatList
                  data={selectedImages}
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: item.uri }}
                        style={styles.image}
                      />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                  horizontal
                  scrollEnabled={true}
                  showsHorizontalScrollIndicator={false}
                  style={styles.imageList}
                />
              )}
            </View>

            <Button
              onPress={handleSubmit}
              title="Buat Laporan"
              loading={loading}
              style={styles.submitButton}
            />
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
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingHorizontal: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  categoryButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#3B82F6',
  },
  institutionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  institutionButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  institutionButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  institutionButtonTextActive: {
    color: '#3B82F6',
  },
  imageList: {
    marginTop: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
    marginBottom: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
