import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTask, updateTaskStatus, addComment } from '@/store/slices/taskSlice';
import { Badge } from '@/components/ui/Badge';

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending', color: 'border-amber-400 bg-amber-50' },
  { value: 'in_progress', label: '⚡ In Progress', color: 'border-blue-400 bg-blue-50' },
  { value: 'completed', label: '✅ Completed', color: 'border-green-400 bg-green-50' },
] as const;

export default function EmployeeTaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const task = useAppSelector(s => s.tasks.currentTask);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    dispatch(fetchTask(Number(id)))
      .unwrap()
      .catch((err: any) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, [id, dispatch]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task || task.status === newStatus) return;
    setUpdating(true);
    try {
      await dispatch(updateTaskStatus({ id: Number(id), status: newStatus })).unwrap();
      Alert.alert('Updated', `Status changed to ${newStatus.replace('_', ' ')}`);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      await dispatch(addComment({ id: Number(id), comment: comment.trim() })).unwrap();
      setComment('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900"><ActivityIndicator size="large" color="#10b981" /></View>;
  }
  if (!task) return null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-emerald-600">← Back</Text>
          </TouchableOpacity>
          <Text className="font-bold text-gray-900 dark:text-white flex-1" numberOfLines={1}>{task.title}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {/* Task info */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</Text>
            {task.description && (
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-3 leading-5">{task.description}</Text>
            )}
            <View className="flex-row gap-2 mb-3">
              <Badge variant={task.status} />
              <Badge variant={task.priority} />
            </View>
            <View className="gap-1">
              {task.due_date && (
                <Text className={`text-sm ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                  {isOverdue ? '⚠️ Overdue: ' : '📅 Due: '}
                  {new Date(task.due_date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </Text>
              )}
              <Text className="text-sm text-gray-500">🏗️ Created by {task.created_by_name}</Text>
              <Text className="text-sm text-gray-400 text-xs">
                Last updated {new Date(task.updated_at).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Update Status */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-3">
              Update Status {updating && '...'}
            </Text>
            <View className="gap-2">
              {STATUS_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleStatusChange(opt.value)}
                  disabled={updating}
                  className={`flex-row items-center justify-between p-3.5 rounded-xl border-2 ${
                    task.status === opt.value ? opt.color : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
                  } ${updating ? 'opacity-50' : ''}`}
                >
                  <Text className={`font-medium text-sm ${task.status === opt.value ? 'text-gray-800' : 'text-gray-500 dark:text-gray-400'}`}>
                    {opt.label}
                  </Text>
                  {task.status === opt.value && (
                    <View className="w-5 h-5 rounded-full bg-emerald-500 items-center justify-center">
                      <Text className="text-white text-xs">✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comments */}
          <View>
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Activity ({task.comments?.length || 0})
            </Text>
            {(task.comments || []).map(c => (
              <View key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-2 shadow-sm">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-semibold text-gray-800 dark:text-white">{c.user_name}</Text>
                  <Text className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 dark:text-gray-400">{c.comment}</Text>
              </View>
            ))}

            <View className="flex-row gap-2 mt-2">
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Add comment or update note..."
                placeholderTextColor="#9ca3af"
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                multiline
              />
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={!comment.trim() || submittingComment}
                className={`self-end bg-emerald-600 rounded-xl px-4 py-2.5 ${(!comment.trim() || submittingComment) ? 'opacity-40' : ''}`}
              >
                <Text className="text-white font-semibold text-sm">Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
