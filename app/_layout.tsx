import React from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FF008C',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.45)',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarBackground: () => <View style={styles.tabBackground} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'WALLET',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: 'TRANSACTIONS',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="receipt-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="apply"
          options={{
            title: 'APPLY',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sparkles" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0A0012',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 0, 140, 0.25)',
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  tabBackground: {
    flex: 1,
    backgroundColor: 'rgba(10, 0, 18, 0.95)',
  },
});