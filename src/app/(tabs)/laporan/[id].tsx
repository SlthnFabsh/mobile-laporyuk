import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Text,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/hooks/useAlert';
import api from '@/config/api';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Laporan {
  id: number;
  title: string;
  description: string;
  status: string;
  image?: string;
  images?: string[];
  user_id: number;
  username: string;
  category_name?: string;
  created_at: string;
  tanggal_kejadian?: string;
  lokasi_kejadian?: string;
  instansi_tujuan?: string;
  rejection_reason?: string;
}

export default function LaporanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { showAlert, showConfirm } = useAlert();

  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLaporan();
    }
  }, [id]);

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/laporan/${id}`);
      setLaporan(response.data);
    } catch (error) {
      console.error('Error fetching laporan:', error);
      showAlert('Error', 'Gagal memuat detail laporan', () => {
        router.back();
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    showConfirm(
      'Hapus Laporan',
      'Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.',
      async () => {
        try {
          setDeleting(true);
          await api.delete(`/laporan/${id}`);
          showAlert('Berhasil', 'Laporan berhasil dihapus', () => {
            router.replace('/(tabs)/home');
          });
        } catch (error: any) {
          console.error('Error deleting laporan:', error);
          const errorMessage = error.response?.data?.error || 'Gagal menghapus laporan';
          showAlert('Error', errorMessage);
        } finally {
          setDeleting(false);
        }
      }
    );
  };

  const handleEdit = () => {
    router.push(`/(tabs)/laporan/${id}/edit`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Ionicons name="checkmark-circle" size={20} color="#10B981" />;
      case 'rejected':
        return <Ionicons name="close-circle" size={20} color="#EF4444" />;
      case 'pending':
      default:
        return <Ionicons name="time" size={20} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      case 'pending':
      default:
        return '#F59E0B';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'pending':
      default:
        return 'Menunggu';
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

  if (!laporan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Laporan tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwnLaporan = user?.id === laporan.user_id;
  const images = laporan.images ? JSON.parse(laporan.images as any) : [laporan.image];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Laporan</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Images */}
        {images && images.length > 0 && (
          <View style={styles.imagesContainer}>
            <FlatList
              data={images}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item }}
                  style={styles.image}
                  defaultSource={require('@/assets/images/placeholder.png')}
                />
              )}
              horizontal
              pagingEnabled
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        <View style={styles.contentContainer}>
          {/* Status */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(laporan.status) + '20' },
            ]}
          >
            <View style={styles.statusContent}>
              {getStatusIcon(laporan.status)}
              <Text style={[styles.statusLabel, { color: getStatusColor(laporan.status) }]}>
                {getStatusLabel(laporan.status)}
              </Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{laporan.title}</Text>

          {/* Metadata */}
          <View style={styles.metadataContainer}>
            <Card>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Oleh</Text>
                <Text style={styles.metadataValue}>{laporan.username}</Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Tanggal</Text>
                <Text style={styles.metadataValue}>
                  {new Date(laporan.created_at).toLocaleDateString('id-ID')}
                </Text>
              </View>
              {laporan.category_name && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Kategori</Text>
                  <Text style={styles.metadataValue}>{laporan.category_name}</Text>
                </View>
              )}
            </Card>
          </View>

          {/* Description */}
          <Card>
            <Text style={styles.sectionTitle}>Deskripsi</Text>
            <Text style={styles.description}>{laporan.description}</Text>
          </Card>

          {/* Additional Info */}
          {(laporan.tanggal_kejadian || laporan.lokasi_kejadian || laporan.instansi_tujuan) && (
            <Card>
              {laporan.tanggal_kejadian && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tanggal Kejadian</Text>
                  <Text style={styles.infoValue}>{laporan.tanggal_kejadian}</Text>
                </View>
              )}
              {laporan.lokasi_kejadian && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lokasi Kejadian</Text>
                  <Text style={styles.infoValue}>{laporan.lokasi_kejadian}</Text>
                </View>
              )}
              {laporan.instansi_tujuan && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Institusi Tujuan</Text>
                  <Text style={styles.infoValue}>{laporan.instansi_tujuan}</Text>
                </View>
              )}
            </Card>
          )}

          {/* Rejection Reason */}
          {laporan.status === 'rejected' && laporan.rejection_reason && (
            <Card style={styles.rejectionCard}>
              <Text style={styles.rejectionTitle}>Alasan Penolakan</Text>
              <Text style={styles.rejectionReason}>{laporan.rejection_reason}</Text>
            </Card>
          )}

          {/* Action Buttons */}
          {isOwnLaporan && (
            <View style={styles.actionButtons}>
              <Button
                onPress={handleEdit}
                title="Edit"
                variant="secondary"
                style={styles.editButton}
              />
              <Button
                onPress={handleDelete}
                title="Hapus"
                variant="danger"
                loading={deleting}
                style={styles.deleteButton}
              />
            </View>
          )}
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
  },
  imagesContainer: {
    height: 250,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: 'auto',
    height: '100%',
    aspectRatio: 1,
  },
  contentContainer: {
    padding: 16,
  },
  statusBadge: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 16,
    lineHeight: 32,
  },
  metadataContainer: {
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  rejectionCard: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  rejectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 8,
  },
  rejectionReason: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
