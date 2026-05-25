import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  const colorScheme = useColorScheme() || 'light';
  const colors = Colors[colorScheme] || Colors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: colors.background || '#fff',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Buat',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <Ionicons name="person" color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="laporan"
        options={{
          href: null,
          title: 'Laporan',
        }}
      />
    </Tabs>
  );
}
