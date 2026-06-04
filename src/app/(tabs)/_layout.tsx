import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const ACTIVE_COLOR = '#3B82F6';
const INACTIVE_COLOR = '#9CA3AF';
const BG_COLOR = '#FFFFFF';

function TabIcon({
  name,
  focused,
  activeName,
}: {
  name: any;
  focused: boolean;
  activeName: any;
}) {
  return (
    <View style={[tabIconStyles.wrap, focused && tabIconStyles.wrapActive]}>
      <Ionicons
        name={focused ? activeName : name}
        size={22}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
    </View>
  );
}

const tabIconStyles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapActive: {
    backgroundColor: '#EFF6FF',
  },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: BG_COLOR,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          height: Platform.OS === 'ios' ? 84 : 66,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home-outline" activeName="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Buat',
          tabBarIcon: ({ focused }) => (
            <View style={createBtnStyles.wrap}>
              <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={28} color={focused ? ACTIVE_COLOR : INACTIVE_COLOR} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person-outline" activeName="person" focused={focused} />
          ),
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

const createBtnStyles = StyleSheet.create({
  wrap: {
    width: 44,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
