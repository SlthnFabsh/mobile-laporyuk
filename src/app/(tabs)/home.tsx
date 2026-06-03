import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/config/api';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Laporan {
  id: number;
  title: string;
  description: string;
  status: string;
  image?: string;
  user_id: number;
  created_at: string;
  category_name?: string;
  lokasi_kejadian?: string;
}

const { width: SCREEN_W } = Dimensions.get('window');

// ── Status Badge ─────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; text: string; icon: any; label: string }> = {
    pending:  { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline',          label: 'Menunggu' },
    approved: { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle-outline', label: 'Disetujui' },
    rejected: { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle-outline',  label: 'Ditolak' },
  };
  const config = map[status] ?? map.pending;
  return (
    <View style={[badgeStyles.wrap, { backgroundColor: config.bg }]}>
      <Ionicons name={config.icon} size={12} color={config.text} />
      <Text style={[badgeStyles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  text: { fontSize: 11, fontWeight: '700' },
});

// ── Laporan Card ─────────────────────────────────────────────────────
const LaporanCard = ({ item, onPress }: { item: Laporan; onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={cardStyles.container}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={cardStyles.row}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={cardStyles.thumb} />
          ) : (
            <View style={cardStyles.thumbPlaceholder}>
              <Ionicons name="document-text-outline" size={28} color="#93C5FD" />
            </View>
          )}
          <View style={cardStyles.content}>
            <Text style={cardStyles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={cardStyles.desc} numberOfLines={2}>{item.description}</Text>
            <View style={cardStyles.meta}>
              <StatusBadge status={item.status} />
              <Text style={cardStyles.date}>{formatDate(item.created_at)}</Text>
            </View>
            {item.category_name && (
              <View style={cardStyles.catWrap}>
                <Ionicons name="grid-outline" size={11} color="#9CA3AF" />
                <Text style={cardStyles.catText}>{item.category_name}</Text>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 72, height: 72, borderRadius: 12, marginRight: 14, backgroundColor: '#EFF6FF' },
  thumbPlaceholder: {
    width: 72, height: 72, borderRadius: 12, marginRight: 14,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  content: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 3, lineHeight: 20 },
  desc: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  date: { fontSize: 11, color: '#9CA3AF' },
  catWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  catText: { fontSize: 11, color: '#9CA3AF' },
});

// ── Stat Card ─────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
  <View style={[statStyles.card, { borderTopColor: color }]}>
    <View style={[statStyles.iconWrap, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={statStyles.value}>{value}</Text>
    <Text style={statStyles.label}>{label}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  value: { fontSize: 22, fontWeight: '900', color: '#111827' },
  label: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 2 },
});

// ── Main Screen ────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [laporans, setLaporans] = useState<Laporan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) fetchLaporans();
  }, [user]);

  const fetchLaporans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/laporan/user');
      // Normalisasi: bisa berupa array langsung, atau objek { data: [...] }, { laporan: [...] }, dll.
      const raw = response.data;
      let result: Laporan[] = [];
      if (Array.isArray(raw)) {
        result = raw;
      } else if (raw && Array.isArray(raw.data)) {
        result = raw.data;
      } else if (raw && Array.isArray(raw.laporan)) {
        result = raw.laporan;
      } else if (raw && Array.isArray(raw.laporans)) {
        result = raw.laporans;
      }
      setLaporans(result);
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

  const handleCreate = () => router.push('/(tabs)/create');
  const handleLaporanPress = (id: number) => router.push(`/(tabs)/laporan/${id}`);

  const safeList = Array.isArray(laporans) ? laporans : [];
  const statPending  = safeList.filter(l => l.status === 'pending').length;
  const statApproved = safeList.filter(l => l.status === 'approved').length;
  const statRejected = safeList.filter(l => l.status === 'rejected').length;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  if (loading && safeList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Memuat laporan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Hero Header ── */}
      <View style={styles.hero}>
        <View style={styles.heroInner}>
          <View style={styles.heroText}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.nama_lengkap?.split(' ')[0] || 'Pengguna'} 👋
            </Text>
            <Text style={styles.heroSub}>Pantau laporan Anda di sini</Text>
          </View>
          <TouchableOpacity style={styles.createFab} onPress={handleCreate} activeOpacity={0.85}>
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stat row */}
        <View style={styles.statsRow}>
          <StatCard icon="time-outline"           label="Menunggu"  value={statPending}  color="#F59E0B" />
          <View style={{ width: 10 }} />
          <StatCard icon="checkmark-circle-outline" label="Disetujui" value={statApproved} color="#10B981" />
          <View style={{ width: 10 }} />
          <StatCard icon="close-circle-outline"   label="Ditolak"   value={statRejected} color="#EF4444" />
        </View>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Laporan Saya</Text>
          <Text style={styles.listCount}>{safeList.length} total</Text>
        </View>

        {safeList.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.emptyContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
          >
            <View style={styles.emptyIcon}>
              <Ionicons name="document-text-outline" size={52} color="#93C5FD" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Laporan</Text>
            <Text style={styles.emptySub}>Mulai buat laporan pertama Anda dan sampaikan aspirasi kepada instansi terkait.</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.emptyBtnText}>Buat Laporan Pertama</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <FlatList
            data={safeList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <LaporanCard item={item} onPress={() => handleLaporanPress(item.id)} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },

  // Hero
  hero: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  heroInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  heroText: { flex: 1 },
  greeting: { fontSize: 14, color: '#BFDBFE', fontWeight: '500' },
  userName: { fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2, letterSpacing: -0.3 },
  heroSub: { fontSize: 13, color: '#93C5FD', marginTop: 4 },
  createFab: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  statsRow: { flexDirection: 'row' },

  // Content
  content: { flex: 1, paddingHorizontal: 16 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 12 },
  listTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  listCount: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  listContent: { paddingBottom: 24 },

  // Empty
  emptyContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
