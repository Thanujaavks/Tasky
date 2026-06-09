import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, RefreshControl, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { TaskCard } from '@/components/TaskCard';
import { Task, TaskPriority, TaskStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  { label: '⏳ Pending', value: 'pending' },
  { label: '⚡ In Progress', value: 'in_progress' },
  { label: '✅ Done', value: 'completed' },
];

const PRIORITY_FILTERS = [
  { label: 'All Priority', value: '' },
  { label: '🔴 High', value: 'high' },
  { label: '🟠 Medium', value: 'medium' },
  { label: '🟢 Low', value: 'low' },
];

export default function AdminTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.getTasks(params);
      setTasks(res.tasks);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, priorityFilter, search]);

  useEffect(() => {
    const timer = setTimeout(loadTasks, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [loadTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks();
  }, [loadTasks]);

  const handleDelete = (id: number, title: string) => {
    Alert.alert('Delete Task', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
          } catch (err: any) { Alert.alert('Error', err.message); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Tasks</Text>
          <TouchableOpacity
            onPress={() => router.push('/(admin)/tasks/create')}
            className="bg-blue-600 rounded-xl px-3 py-2"
          >
            <Text className="text-white text-sm font-semibold">+ New Task</Text>
          </TouchableOpacity>
        </View>
        {/* Search */}
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
              <Text className="text-gray-400 text-lg">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {/* Status filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setStatusFilter(f.value)}
              className={`mr-2 px-3 py-1.5 rounded-full border ${statusFilter === f.value ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
            >
              <Text className={`text-sm font-medium ${statusFilter === f.value ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PRIORITY_FILTERS.map(f => (
            <TouchableOpacity
              key={f.value}
              onPress={() => setPriorityFilter(f.value)}
              className={`mr-2 px-3 py-1.5 rounded-full border ${priorityFilter === f.value ? 'bg-gray-800 border-gray-800' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}
            >
              <Text className={`text-sm font-medium ${priorityFilter === f.value ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
        >
          {tasks.length === 0 ? (
            <View className="items-center py-16">
              <Text className="text-5xl mb-4">📋</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-base">No tasks found</Text>
            </View>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                showAssignee
                onPress={() => router.push(`/(admin)/tasks/${task.id}`)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
