import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>User tidak ditemukan</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#3B82F6" />
            </View>
          </View>

          <Text style={styles.userName}>{user.nama_lengkap}</Text>
          <Text style={styles.userRole}>{user.role === 'admin' ? 'Admin' : 'Pengguna'}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NIK</Text>
            <Text style={styles.infoValue}>{user.nik}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alamat</Text>
            <Text style={styles.infoValue}>{user.alamat}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Terdaftar sejak</Text>
            <Text style={styles.infoValue}>
              {new Date(user.created_at).toLocaleDateString('id-ID')}
            </Text>
          </View>
        </Card>

        {/* Logout Button */}
        <View style={styles.buttonContainer}>
          <Button
            onPress={handleLogout}
            title="Keluar"
            variant="danger"
            style={styles.logoutButton}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  profileCard: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  infoRow: {
    width: '100%',
    marginBottom: 16,
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
  buttonContainer: {
    marginBottom: 24,
  },
  logoutButton: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
