import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, RefreshControl, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/types';

const FILTERS = [
  { label: 'All', value: '' },
  { label: '⏳ Pending', value: 'pending' },
  { label: '⚡ In Progress', value: 'in_progress' },
  { label: '✅ Done', value: 'completed' },
];

export default function EmployeeTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.getTasks(params);
      setTasks(res.tasks);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const t = setTimeout(loadTasks, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [loadTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks();
  }, [loadTasks]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-800 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-3">My Tasks</Text>

        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2 mb-3">
          <Text className="mr-2">🔍</Text>
          <TextInput
            placeholder="Search tasks..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-gray-900 dark:text-white text-sm"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text className="text-gray-400 text-base">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setStatusFilter(f.value)}
              className={`mr-2 px-4 py-1.5 rounded-full border ${statusFilter === f.value ? 'bg-emerald-600 border-emerald-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
            >
              <Text className={`text-sm font-medium ${statusFilter === f.value ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
        >
          {tasks.length === 0 ? (
            <View className="items-center py-20">
              <Text className="text-5xl mb-4">📋</Text>
              <Text className="font-semibold text-gray-600 dark:text-gray-400 mb-1">No tasks found</Text>
              <Text className="text-sm text-gray-400">
                {statusFilter ? `No ${statusFilter.replace('_', ' ')} tasks` : 'You have no tasks assigned'}
              </Text>
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
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
