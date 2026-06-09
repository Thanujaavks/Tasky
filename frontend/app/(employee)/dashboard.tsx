import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { StatCard } from '@/components/ui/StatCard';
import { TaskCard } from '@/components/TaskCard';
import { Task, TaskStats } from '@/types';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.getStats(),
        api.getTasks({ status: 'in_progress' }),
      ]);
      setStats(statsRes.stats);
      setTasks(tasksRes.tasks.slice(0, 5));
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900"><ActivityIndicator size="large" color="#10b981" /></View>;
  }

  const completionRate = stats && stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
      >
        {/* Header */}
        <View className="bg-emerald-600 px-6 pt-4 pb-10">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-emerald-200 text-sm">{getGreeting()},</Text>
              <Text className="text-white text-xl font-bold">{user?.name} 👋</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} className="bg-emerald-700 rounded-xl p-2.5">
              <Text className="text-white text-sm">Logout</Text>
            </TouchableOpacity>
          </View>
          {user?.department && (
            <View className="bg-emerald-700 self-start rounded-full px-3 py-1">
              <Text className="text-emerald-200 text-xs">🏢 {user.department}</Text>
            </View>
          )}
        </View>

        <View className="px-4 -mt-5">
          {/* Completion card */}
          {stats && (
            <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-bold text-gray-900 dark:text-white">My Progress</Text>
                <Text className="text-2xl font-bold text-emerald-600">{completionRate}%</Text>
              </View>
              <View className="bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-3">
                <View className="bg-emerald-500 rounded-full h-3" style={{ width: `${completionRate}%` }} />
              </View>
              <View className="flex-row gap-3">
                <StatCard label="Total" value={stats.total} color="text-gray-700" bgColor="bg-gray-50 dark:bg-gray-700" icon="📋" />
                <StatCard label="Done" value={stats.completed} color="text-green-700" bgColor="bg-green-50 dark:bg-green-900/30" icon="✅" />
                <StatCard label="Active" value={stats.in_progress} color="text-blue-700" bgColor="bg-blue-50 dark:bg-blue-900/30" icon="⚡" />
              </View>
            </View>
          )}

          {/* Alerts */}
          {stats && stats.overdue > 0 && (
            <TouchableOpacity
              onPress={() => router.push('/(employee)/tasks/index')}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-4 flex-row items-center gap-3"
            >
              <Text className="text-2xl">⚠️</Text>
              <View>
                <Text className="font-semibold text-red-700 dark:text-red-400">
                  {stats.overdue} overdue {stats.overdue === 1 ? 'task' : 'tasks'}
                </Text>
                <Text className="text-xs text-red-500">Tap to view and update</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Active tasks */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-gray-900 dark:text-white">In Progress</Text>
              <TouchableOpacity onPress={() => router.push('/(employee)/tasks/index')}>
                <Text className="text-emerald-600 text-sm font-medium">See all →</Text>
              </TouchableOpacity>
            </View>
            {tasks.length === 0 ? (
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center">
                <Text className="text-4xl mb-3">🎉</Text>
                <Text className="font-semibold text-gray-700 dark:text-gray-300 mb-1">All caught up!</Text>
                <Text className="text-sm text-gray-400">No tasks in progress</Text>
              </View>
            ) : (
              tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onPress={() => router.push(`/(employee)/tasks/${task.id}`)}
                />
              ))
            )}
          </View>

          {/* Quick stats row */}
          {stats && (
            <View className="flex-row gap-3 mb-6">
              <StatCard label="Pending" value={stats.pending} color="text-amber-700" bgColor="bg-amber-50 dark:bg-amber-900/30" icon="⏳" />
              <StatCard label="High Priority" value={stats.high_priority} color="text-red-700" bgColor="bg-red-50 dark:bg-red-900/30" icon="🔴" />
              <StatCard label="Overdue" value={stats.overdue} color="text-purple-700" bgColor="bg-purple-50 dark:bg-purple-900/30" icon="⚠️" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
