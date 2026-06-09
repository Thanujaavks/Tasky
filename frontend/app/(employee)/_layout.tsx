import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View className="items-center pt-1">
      <Text className={`text-xl ${focused ? 'opacity-100' : 'opacity-50'}`}>{emoji}</Text>
      <Text className={`text-xs mt-0.5 ${focused ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>{label}</Text>
    </View>
  );
}

export default function EmployeeLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === 'admin') return <Redirect href="/(admin)/dashboard" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: 'white',
          borderTopColor: '#f1f5f9',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="My Tasks" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }}
      />
      <Tabs.Screen name="tasks/[id]" options={{ href: null }} />
    </Tabs>
  );
}
