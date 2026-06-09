import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Task, User } from '@/types';

const STATUSES = ['pending', 'in_progress', 'completed'] as const;
const PRIORITIES = ['low', 'medium', 'high'] as const;

export default function AdminTaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');

  // Edit fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.getTask(Number(id)),
      api.getEmployees(),
    ]).then(([taskRes, empRes]) => {
      const t = taskRes.task;
      setTask(t);
      setTitle(t.title);
      setDescription(t.description || '');
      setPriority(t.priority);
      setStatus(t.status);
      setDueDate(t.due_date ? t.due_date.split('T')[0] : '');
      setAssignedTo(t.assigned_to || null);
      setEmployees(empRes.employees);
    }).catch((err: any) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateTask(Number(id), {
        title, description, priority, status,
        due_date: dueDate || null,
        assigned_to: assignedTo,
      });
      const res = await api.getTask(Number(id));
      setTask(res.task);
      setEditing(false);
      Alert.alert('Success', 'Task updated');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await api.deleteTask(Number(id));
          router.back();
        },
      },
    ]);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await api.addComment(Number(id), comment.trim());
      setComment('');
      const res = await api.getTask(Number(id));
      setTask(res.task);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  if (!task) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-600 text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900 dark:text-white">Task Detail</Text>
          <View className="flex-row gap-2">
            {editing ? (
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text className="text-gray-500 text-sm">Cancel</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={() => setEditing(true)} className="bg-blue-100 dark:bg-blue-900 rounded-lg px-3 py-1.5">
                  <Text className="text-blue-600 text-sm font-medium">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} className="bg-red-100 dark:bg-red-900 rounded-lg px-3 py-1.5">
                  <Text className="text-red-600 text-sm font-medium">Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
            {editing ? (
              <>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 pb-2 mb-3"
                  placeholder="Task title"
                />
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  className="text-sm text-gray-500 dark:text-gray-400 mb-3 border-b border-gray-200 pb-2"
                  placeholder="Description..."
                  multiline
                  numberOfLines={3}
                />

                {/* Status selector */}
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</Text>
                <View className="flex-row gap-2 mb-3">
                  {STATUSES.map(s => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setStatus(s)}
                      className={`flex-1 py-2 rounded-xl border items-center ${status === s ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-semibold capitalize ${status === s ? 'text-white' : 'text-gray-500'}`}>
                        {s.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Priority selector */}
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Priority</Text>
                <View className="flex-row gap-2 mb-3">
                  {PRIORITIES.map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPriority(p)}
                      className={`flex-1 py-2 rounded-xl border items-center ${priority === p ? 'bg-gray-800 border-gray-800' : 'bg-gray-100 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-semibold capitalize ${priority === p ? 'text-white' : 'text-gray-500'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="Due date YYYY-MM-DD"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white mb-3"
                  placeholderTextColor="#9ca3af"
                />

                {/* Assign employee */}
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Assign To</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                  <TouchableOpacity
                    onPress={() => setAssignedTo(null)}
                    className={`mr-2 px-3 py-2 rounded-xl border ${assignedTo === null ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'}`}
                  >
                    <Text className={assignedTo === null ? 'text-white text-sm' : 'text-gray-600 text-sm'}>None</Text>
                  </TouchableOpacity>
                  {employees.map(emp => (
                    <TouchableOpacity
                      key={emp.id}
                      onPress={() => setAssignedTo(emp.id)}
                      className={`mr-2 px-3 py-2 rounded-xl border ${assignedTo === emp.id ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'}`}
                    >
                      <Text className={assignedTo === emp.id ? 'text-white text-sm' : 'text-gray-600 text-sm'}>{emp.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Button title="Save Changes" onPress={handleSave} loading={saving} />
              </>
            ) : (
              <>
                <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</Text>
                {task.description ? (
                  <Text className="text-gray-500 dark:text-gray-400 text-sm mb-3">{task.description}</Text>
                ) : null}
                <View className="flex-row gap-2 flex-wrap mb-3">
                  <Badge variant={task.status} />
                  <Badge variant={task.priority} />
                </View>
                <View className="flex-row gap-4 flex-wrap">
                  {task.assigned_to_name && (
                    <Text className="text-sm text-gray-500">👤 {task.assigned_to_name}</Text>
                  )}
                  {task.due_date && (
                    <Text className="text-sm text-gray-500">
                      📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  )}
                  <Text className="text-sm text-gray-500">🏗️ {task.created_by_name}</Text>
                </View>
              </>
            )}
          </View>

          {/* Comments */}
          <View className="mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Comments ({task.comments?.length || 0})
            </Text>
            {(task.comments || []).map(c => (
              <View key={c.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 mb-2 shadow-sm">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.user_name}</Text>
                  <Text className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-sm text-gray-600 dark:text-gray-400">{c.comment}</Text>
              </View>
            ))}

            <View className="flex-row gap-2 mt-2">
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Add a comment..."
                placeholderTextColor="#9ca3af"
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                multiline
              />
              <TouchableOpacity
                onPress={handleComment}
                disabled={!comment.trim()}
                className={`self-end bg-blue-600 rounded-xl px-4 py-2.5 ${!comment.trim() ? 'opacity-40' : ''}`}
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
