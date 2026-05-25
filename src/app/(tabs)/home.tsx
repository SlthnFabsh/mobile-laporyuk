import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/config/api';
import { LaporanItem } from '@/components/LaporanItem';
import { Button } from '@/components/Button';

interface Laporan {
  id: number;
  title: string;
  description: string;
  status: string;
  image?: string;
  user_id: number;
  created_at: string;
}

export default function LaporanListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [laporans, setLaporans] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLaporans();
    }
  }, [user]);

  const fetchLaporans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/laporan/user');
      setLaporans(response.data || []);
    } catch (error) {
      console.error('Error fetching laporans:', error);
      setLaporans([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLaporans();
    setRefreshing(false);
  };

  const handleCreateNew = () => {
    router.push('/(tabs)/create');
  };

  const handleLaporanPress = (id: number) => {
    router.push(`/(tabs)/laporan/${id}`);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>😢</View>
      <Text style={styles.emptyTitle}>Belum ada laporan</Text>
      <Text style={styles.emptyDescription}>
        Mulai buat laporan pertama Anda sekarang
      </Text>
      <Button
        onPress={handleCreateNew}
        title="Buat Laporan"
        style={styles.emptyButton}
      />
    </View>
  );

  if (loading && laporans.length === 0) {
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
        <Text style={styles.title}>Laporan Saya</Text>
        <Button
          onPress={handleCreateNew}
          title="Buat Baru"
          size="small"
          style={styles.createButton}
        />
      </View>

      {laporans.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={laporans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <LaporanItem
              id={item.id}
              title={item.title}
              description={item.description}
              status={item.status as 'pending' | 'approved' | 'rejected'}
              image={item.image}
              onPress={() => handleLaporanPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
  },
  createButton: {
    width: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    width: '100%',
    maxWidth: 200,
  },
});
