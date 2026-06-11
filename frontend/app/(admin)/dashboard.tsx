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
import { EmployeeStats, Task, TaskStats } from '@/types';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        api.getStats(),
        api.getTasks({ status: 'in_progress' }),
      ]);
      setStats(statsRes.stats);
      setEmployeeStats(statsRes.employeeStats || []);
      setRecentTasks(tasksRes.tasks.slice(0, 5));
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
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
      >
        {/* Header */}
        <View className="bg-blue-600 px-6 pt-4 pb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-blue-200 text-sm">Good day,</Text>
              <Text className="text-white text-xl font-bold">{user?.name} 👑</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} className="bg-blue-700 rounded-xl p-2.5">
              <Text className="text-white text-sm font-medium">Logout</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-blue-100 text-sm">Here's your team's overview</Text>
        </View>

        <View className="px-4 -mt-4">
          {/* Stats Grid */}
          {stats && (
            <View className="mb-4">
              <View className="flex-row gap-3 mb-3">
                <StatCard label="Total Tasks" value={stats.total} color="text-blue-700" bgColor="bg-blue-50 dark:bg-blue-900/30" icon="📋" />
                <StatCard label="Completed" value={stats.completed} color="text-green-700" bgColor="bg-green-50 dark:bg-green-900/30" icon="✅" />
              </View>
              <View className="flex-row gap-3 mb-3">
                <StatCard label="In Progress" value={stats.in_progress} color="text-orange-700" bgColor="bg-orange-50 dark:bg-orange-900/30" icon="⚡" />
                <StatCard label="Pending" value={stats.pending} color="text-amber-700" bgColor="bg-amber-50 dark:bg-amber-900/30" icon="⏳" />
              </View>
              <View className="flex-row gap-3">
                <StatCard label="High Priority" value={stats.high_priority} color="text-red-700" bgColor="bg-red-50 dark:bg-red-900/30" icon="🔴" />
                <StatCard label="Overdue" value={stats.overdue} color="text-purple-700" bgColor="bg-purple-50 dark:bg-purple-900/30" icon="⚠️" />
              </View>
            </View>
          )}

          {/* Active Tasks */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-bold text-gray-900 dark:text-white">Active Tasks</Text>
              <TouchableOpacity onPress={() => router.push('/(admin)/tasks')}>
                <Text className="text-blue-600 text-sm font-medium">See all →</Text>
              </TouchableOpacity>
            </View>
            {recentTasks.length === 0 ? (
              <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 items-center">
                <Text className="text-3xl mb-2">🎉</Text>
                <Text className="text-gray-500 dark:text-gray-400">No active tasks right now</Text>
              </View>
            ) : (
              recentTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  showAssignee
                  onPress={() => router.push(`/(admin)/tasks/${task.id}`)}
                />
              ))
            )}
          </View>

          {/* Team Performance */}
          {employeeStats.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-base font-bold text-gray-900 dark:text-white">Team Performance</Text>
                <TouchableOpacity onPress={() => router.push('/(admin)/employees')}>
                  <Text className="text-blue-600 text-sm font-medium">See all →</Text>
                </TouchableOpacity>
              </View>
              {employeeStats.slice(0, 4).map(emp => {
                const completion = emp.total_tasks > 0
                  ? Math.round((emp.completed / emp.total_tasks) * 100) : 0;
                return (
                  <View key={emp.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                          <Text className="text-base font-bold text-blue-700 dark:text-blue-300">
                            {emp.name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View>
                          <Text className="font-semibold text-gray-900 dark:text-white text-sm">{emp.name}</Text>
                          <Text className="text-xs text-gray-400">{emp.department || 'No department'}</Text>
                        </View>
                      </View>
                      <Text className="text-sm font-bold text-blue-600">{completion}%</Text>
                    </View>
                    <View className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <View
                        className="bg-blue-500 rounded-full h-2"
                        style={{ width: `${completion}%` }}
                      />
                    </View>
                    <Text className="text-xs text-gray-400 mt-1">
                      {emp.completed}/{emp.total_tasks} tasks completed
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(admin)/tasks/create')}
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg elevation-5"
      >
        <Text className="text-white text-2xl font-light">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
