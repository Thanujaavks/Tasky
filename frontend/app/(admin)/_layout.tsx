import React from 'react';
import { Tabs } from 'expo-router';
import { View, Platform, ColorValue } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  focused,
  color,
}: {
  name: IoniconsName;
  focused: boolean;
  color: ColorValue;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: focused ? '#EFF6FF' : 'transparent',
        minWidth: 56,
      }}
    >
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function AdminLayout() {
  const user = useAppSelector(s => s.auth.user);
  const insets = useSafeAreaInsets();

  if (!user || user.role !== 'admin') return <Redirect href="/(auth)/login" />;

  const tabBarHeight = 56 + (Platform.OS === 'ios' ? insets.bottom : 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        tabBarItemStyle: {
          paddingTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'grid' : 'grid-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks/index"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'checkbox' : 'checkbox-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="employees/index"
        options={{
          title: 'Team',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="tasks/create"   options={{ href: null }} />
      <Tabs.Screen name="tasks/[id]"     options={{ href: null }} />
      <Tabs.Screen name="employees/[id]" options={{ href: null }} />
    </Tabs>
  );
}
