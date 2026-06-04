import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useImagePicker } from '@/hooks/useImagePicker';
import api from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Category {
  id: number;
  name: string;
}

interface Institution {
  id: number;
  name: string;
}

// ── Success Modal ────────────────────────────────────────────────────
const SuccessModal = ({ visible, onDone }: { visible: boolean; onDone: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[modalStyles.overlay, { opacity: opacityAnim }]}>
      <Animated.View style={[modalStyles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={modalStyles.iconCircle}>
          <Ionicons name="checkmark-circle" size={56} color="#10B981" />
        </View>
        <Text style={modalStyles.title}>Laporan Berhasil!</Text>
        <Text style={modalStyles.subtitle}>
          Laporan Anda telah berhasil dikirim dan sedang menunggu verifikasi.
        </Text>
        <TouchableOpacity style={modalStyles.btn} onPress={onDone} activeOpacity={0.85}>
          <Text style={modalStyles.btnText}>Lihat Dashboard →</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '82%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  btn: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

// ── Main Screen ────────────────────────────────────────────────────
const { width: SCREEN_W } = Dimensions.get('window');

export default function CreateLaporanScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedImages, addImage, removeImage, clearImages } = useImagePicker();

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
  const [showSuccess, setShowSuccess] = useState(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

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
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  // Hitung progress form
  const calcProgress = () => {
    const fields = [
      formData.title.trim(),
      formData.description.trim(),
      formData.category_id,
      formData.tanggal_kejadian,
      formData.lokasi_kejadian,
    ];
    const filled = fields.filter(Boolean).length;
    return filled / fields.length;
  };

  useEffect(() => {
    const prog = calcProgress();
    Animated.timing(progressAnim, {
      toValue: prog * (SCREEN_W - 32),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [formData]);

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
    if (!formData.title.trim()) newErrors.title = 'Judul wajib diisi';
    if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
    
    if (formData.tanggal_kejadian.trim()) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.tanggal_kejadian.trim())) {
        newErrors.tanggal_kejadian = 'Format tanggal harus YYYY-MM-DD (contoh: 2026-06-03)';
      } else {
        const parts = formData.tanggal_kejadian.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          newErrors.tanggal_kejadian = 'Tanggal tidak valid';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      // ✅ Ambil token untuk Authorization header
      const token = await AsyncStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.tanggal_kejadian) formDataToSend.append('tanggal_kejadian', formData.tanggal_kejadian);
      if (formData.lokasi_kejadian) formDataToSend.append('lokasi_kejadian', formData.lokasi_kejadian);
      if (formData.instansi_tujuan) formDataToSend.append('instansi_tujuan', formData.instansi_tujuan);
      if (formData.category_id) formDataToSend.append('category_id', formData.category_id);

      console.log('📸 Selected images:', selectedImages.length);
      for (let index = 0; index < selectedImages.length; index++) {
        const image = selectedImages[index];
        const mimeType = image.type || 'image/jpeg';
        const fileName = image.name || `photo_${index}.jpg`;

        console.log(`📎 Image ${index}: uri=${image.uri?.substring(0, 60)}, type=${mimeType}, name=${fileName}`);

        if (Platform.OS === 'web') {
          try {
            // Konversi URI (blob:http://... atau data:...) menjadi File object agar bisa diparse oleh native FormData di browser
            const response = await fetch(image.uri);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: mimeType });
            formDataToSend.append('files', file);
            console.log(`✅ Web image ${index} converted to File object and appended.`);
          } catch (e) {
            console.error(`❌ Error converting web image ${index} to File:`, e);
            // Fallback ke model native (bisa error di browser tapi setidaknya dicoba)
            formDataToSend.append('files', {
              uri: image.uri,
              type: mimeType,
              name: fileName,
            } as any);
          }
        } else {
          // ✅ Format khusus React Native untuk upload file via fetch/XHR pada iOS/Android
          formDataToSend.append('files', {
            uri: image.uri,
            type: mimeType,
            name: fileName,
          } as any);
        }
      }

      // ✅ KUNCI: Gunakan native fetch() bukan Axios untuk upload file.
      // Axios di React Native tidak bisa serialize file URI {uri,type,name} ke multipart body.
      // Native fetch() di React Native sudah support format ini secara native.
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
      console.log('📤 Sending laporan via fetch to:', `${apiBaseUrl}/laporan`);

      const response = await fetch(`${apiBaseUrl}/laporan`, {
        method: 'POST',
        headers: {
          // ✅ JANGAN set Content-Type secara manual!
          // fetch otomatis set 'multipart/form-data; boundary=...' saat body adalah FormData.
          // Jika di-set manual tanpa boundary, backend (multer) akan error: "Boundary not found"
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formDataToSend,
      });

      const responseData = await response.json();
      console.log('📥 Response status:', response.status, 'data:', responseData);

      if (!response.ok) {
        throw new Error(responseData?.error || `HTTP error ${response.status}`);
      }

      console.log('✅ Laporan created:', responseData);
      setShowSuccess(true);
    } catch (error: any) {
      console.error('❌ Error creating laporan:', error);
      const errorMessage = error.message || 'Gagal membuat laporan';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
    clearImages();
    setFormData({ title: '', description: '', tanggal_kejadian: '', lokasi_kejadian: '', instansi_tujuan: '', category_id: '' });
    router.replace('/(tabs)/home');
  };

  if (fetchLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SuccessModal visible={showSuccess} onDone={handleSuccessDone} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* ── Header Gradient ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Buat Laporan</Text>
            <Text style={styles.headerSub}>Sampaikan aspirasi Anda</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="document-text" size={22} color="#fff" />
          </View>
        </View>

        {/* ── Progress Bar ── */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressAnim }]} />
          <Text style={styles.progressLabel}>Kelengkapan form</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* ── Section: Info Dasar ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="information-circle" size={16} color="#3B82F6" /> Informasi Dasar
            </Text>

            {/* Judul */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Judul Laporan <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputBox, errors.title ? styles.inputBoxError : null]}>
                <Ionicons name="megaphone-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Tulis judul laporan yang jelas..."
                  placeholderTextColor="#9CA3AF"
                  value={formData.title}
                  onChangeText={(t) => handleChange('title', t)}
                />
              </View>
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Deskripsi */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Deskripsi <Text style={styles.required}>*</Text></Text>
              <View style={[styles.inputBox, styles.textareaBox, errors.description ? styles.inputBoxError : null]}>
                <TextInput
                  style={[styles.textInput, styles.textarea]}
                  placeholder="Jelaskan kejadian secara lengkap: lokasi, waktu, kronologi..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={5}
                  value={formData.description}
                  onChangeText={(t) => handleChange('description', t)}
                  textAlignVertical="top"
                />
              </View>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>
          </View>

          {/* ── Section: Detail ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="calendar" size={16} color="#3B82F6" /> Detail Kejadian
            </Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Tanggal Kejadian <Text style={styles.optional}>(Opsional)</Text></Text>
              <View style={[styles.inputBox, errors.tanggal_kejadian ? styles.inputBoxError : null]}>
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={formData.tanggal_kejadian}
                  onChangeText={(t) => handleChange('tanggal_kejadian', t)}
                />
              </View>
              {errors.tanggal_kejadian && <Text style={styles.errorText}>{errors.tanggal_kejadian}</Text>}
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Lokasi Kejadian <Text style={styles.optional}>(Opsional)</Text></Text>
              <View style={styles.inputBox}>
                <Ionicons name="location-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Jl. Merdeka No.1, Jakarta"
                  placeholderTextColor="#9CA3AF"
                  value={formData.lokasi_kejadian}
                  onChangeText={(t) => handleChange('lokasi_kejadian', t)}
                />
              </View>
            </View>
          </View>

          {/* ── Section: Kategori ── */}
          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="grid" size={16} color="#3B82F6" /> Kategori <Text style={styles.optional}>(Opsional)</Text>
              </Text>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.chipBtn, formData.category_id === item.id.toString() && styles.chipBtnActive]}
                    onPress={() => handleChange('category_id', formData.category_id === item.id.toString() ? '' : item.id.toString())}
                  >
                    {formData.category_id === item.id.toString() && (
                      <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.chipText, formData.category_id === item.id.toString() && styles.chipTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled
              />
            </View>
          )}

          {/* ── Section: Institusi ── */}
          {institutions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="business" size={16} color="#3B82F6" /> Institusi Tujuan <Text style={styles.optional}>(Opsional)</Text>
              </Text>
              <FlatList
                data={institutions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.chipBtn, formData.instansi_tujuan === item.id.toString() && styles.chipBtnActive]}
                    onPress={() => handleChange('instansi_tujuan', formData.instansi_tujuan === item.id.toString() ? '' : item.id.toString())}
                  >
                    {formData.instansi_tujuan === item.id.toString() && (
                      <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.chipText, formData.instansi_tujuan === item.id.toString() && styles.chipTextActive]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled
              />
            </View>
          )}

          {/* ── Section: Foto ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="images" size={16} color="#3B82F6" /> Foto Pendukung{' '}
              <Text style={styles.optional}>(Opsional)</Text>
            </Text>
            <Text style={styles.photoHint}>Foto membantu laporan lebih mudah diverifikasi</Text>

            <TouchableOpacity style={styles.addPhotoBtn} onPress={addImage} activeOpacity={0.8}>
              <Ionicons name="camera-outline" size={22} color="#3B82F6" />
              <Text style={styles.addPhotoBtnText}>
                {selectedImages.length === 0 ? 'Tambah Foto' : `Tambah Foto Lagi (${selectedImages.length})`}
              </Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <FlatList
                data={selectedImages}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.photoThumb}>
                    <Image source={{ uri: item.uri }} style={styles.photoImg} />
                    <TouchableOpacity style={styles.removePhoto} onPress={() => removeImage(index)}>
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 12 }}
              />
            )}
          </View>

          {/* ── Error Global ── */}
          {errors.submit && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorBannerText}>{errors.submit}</Text>
            </View>
          )}

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.submitBtnText}>Kirim Laporan</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },

  // Header
  header: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  headerSub: { fontSize: 13, color: '#BFDBFE', marginTop: 2 },
  headerBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Progress
  progressContainer: {
    backgroundColor: '#DBEAFE',
    height: 6,
    marginBottom: 0,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressLabel: { display: 'none' } as any,

  scrollContent: { paddingTop: 16, paddingHorizontal: 16 },

  // Section
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 14,
  },

  // Fields
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  required: { color: '#EF4444' },
  optional: { color: '#9CA3AF', fontWeight: '400', fontSize: 12 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputBoxError: { borderColor: '#EF4444' },
  textareaBox: { alignItems: 'flex-start', paddingTop: 12 },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, fontSize: 14, color: '#111827', minHeight: 44 },
  textarea: { minHeight: 100 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 2 },

  // Chips
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginRight: 8,
  },
  chipBtnActive: { borderColor: '#3B82F6', backgroundColor: '#EFF6FF' },
  chipText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  chipTextActive: { color: '#3B82F6', fontWeight: '700' },

  // Photo
  photoHint: { fontSize: 12, color: '#9CA3AF', marginBottom: 12, marginTop: -8 },
  addPhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  addPhotoBtnText: { color: '#3B82F6', fontWeight: '700', fontSize: 14 },
  photoThumb: { position: 'relative', marginRight: 10 },
  photoImg: { width: 90, height: 90, borderRadius: 10, backgroundColor: '#E5E7EB' },
  removePhoto: {
    position: 'absolute', top: -6, right: -6,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#EF4444',
    justifyContent: 'center', alignItems: 'center',
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: { color: '#EF4444', fontSize: 13, flex: 1 },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnDisabled: { opacity: 0.65 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
