import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Ionicons from '@expo/vector-icons/Ionicons';

// ── Info Row ─────────────────────────────────────────────────────────
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value?: string;
}) => (
  <View style={infoRowStyles.container}>
    <View style={infoRowStyles.iconWrap}>
      <Ionicons name={icon} size={18} color="#3B82F6" />
    </View>
    <View style={infoRowStyles.textWrap}>
      <Text style={infoRowStyles.label}>{label}</Text>
      <Text style={infoRowStyles.value}>{value || '-'}</Text>
    </View>
  </View>
);

const infoRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textWrap: { flex: 1 },
  label: { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginBottom: 2 },
  value: { fontSize: 14, color: '#111827', fontWeight: '600' },
});

// ── Menu Item ─────────────────────────────────────────────────────────
const MenuItem = ({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity style={menuStyles.item} onPress={onPress} activeOpacity={0.75}>
    <View style={[menuStyles.iconWrap, danger && menuStyles.iconWrapDanger]}>
      <Ionicons name={icon} size={20} color={danger ? '#EF4444' : '#3B82F6'} />
    </View>
    <Text style={[menuStyles.label, danger && menuStyles.labelDanger]}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
  </TouchableOpacity>
);

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconWrapDanger: { backgroundColor: '#FEF2F2' },
  label: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1F2937' },
  labelDanger: { color: '#EF4444' },
});

// ── Main Screen ────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = typeof window !== 'undefined'
        ? window.confirm('Apakah Anda yakin ingin keluar dari akun ini?')
        : false;

      if (!confirmed) {
        return;
      }

      await logout();
      router.replace('/(auth)/login');
      return;
    }

    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="person-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.noUserText}>Pengguna tidak ditemukan</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Login Ulang</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const roleBadge = user.role === 'admin'
    ? { label: 'Admin', bg: '#FEF3C7', text: '#D97706', icon: 'shield-checkmark' }
    : { label: 'Pengguna', bg: '#EFF6FF', text: '#3B82F6', icon: 'person-circle' };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Hero Header ── */}
      <View style={styles.hero}>
        {/* Avatar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.nama_lengkap)}</Text>
          </View>
        </View>

        <Text style={styles.heroName}>{user.nama_lengkap}</Text>
        <Text style={styles.heroEmail}>{user.email}</Text>

        <View style={[styles.roleBadge, { backgroundColor: roleBadge.bg }]}>
          <Ionicons name={roleBadge.icon as any} size={14} color={roleBadge.text} />
          <Text style={[styles.roleText, { color: roleBadge.text }]}>{roleBadge.label}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Info Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informasi Akun</Text>
          <InfoRow icon="card-outline"        label="NIK"           value={user.nik} />
          <InfoRow icon="mail-outline"        label="Email"         value={user.email} />
          <InfoRow icon="home-outline"        label="Alamat"        value={user.alamat} />
          <InfoRow icon="calendar-outline"    label="Bergabung"     value={formatDate(user.created_at)} />
        </View>

        {/* ── Menu Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Menu</Text>
          <MenuItem
            icon="document-text-outline"
            label="Laporan Saya"
            onPress={() => router.push('/(tabs)/home')}
          />
          <MenuItem
            icon="add-circle-outline"
            label="Buat Laporan Baru"
            onPress={() => router.push('/(tabs)/create')}
          />
          <MenuItem
            icon="log-out-outline"
            label="Keluar"
            onPress={handleLogout}
            danger
          />
        </View>

        {/* ── App Info ── */}
        <View style={styles.appInfoWrap}>
          <Text style={styles.appInfoText}>LaporYuk! — Layanan Aspirasi dan Pengaduan Online</Text>
          <Text style={styles.appInfoVersion}>v1.0.0</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4FF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  noUserText: { color: '#6B7280', fontSize: 16, marginTop: 12, marginBottom: 20 },
  loginBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Hero
  hero: {
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#3B82F6' },
  heroName: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: -0.3 },
  heroEmail: { fontSize: 14, color: '#BFDBFE', marginTop: 4, marginBottom: 12 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: { fontSize: 13, fontWeight: '700' },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  // App info
  appInfoWrap: { alignItems: 'center', paddingVertical: 8 },
  appInfoText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  appInfoVersion: { fontSize: 11, color: '#D1D5DB', marginTop: 4 },
});
