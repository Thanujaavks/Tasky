import React, { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTask } from '@/store/slices/taskSlice';
import { fetchEmployees } from '@/store/slices/employeeSlice';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';

const PRIORITIES = ['low', 'medium', 'high'] as const;

export default function CreateTask() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const employees = useAppSelector(s => s.employees.employees);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await dispatch(createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        assigned_to: assignedTo || undefined,
      })).unwrap();
      Alert.alert('Success', 'Task created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityColors: Record<string, string> = {
    low: 'border-gray-300 bg-gray-50',
    medium: 'border-orange-400 bg-orange-50',
    high: 'border-red-400 bg-red-50',
  };
  const priorityTextColors: Record<string, string> = {
    low: 'text-gray-600',
    medium: 'text-orange-600',
    high: 'text-red-600',
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <Text className="text-blue-600 text-base">← Back</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">Create Task</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Input
            label="Task Title *"
            placeholder="Enter task title"
            value={title}
            onChangeText={setTitle}
            error={errors.title}
          />

          <Input
            label="Description"
            placeholder="Describe the task..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="min-h-[80px]"
            textAlignVertical="top"
          />

          {/* Priority */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</Text>
            <View className="flex-row gap-2">
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPriority(p)}
                  className={`flex-1 py-2.5 rounded-xl border-2 items-center ${priority === p ? priorityColors[p] + ' ' : 'border-gray-200 bg-white dark:bg-gray-800'}`}
                >
                  <Text className={`font-semibold text-sm capitalize ${priority === p ? priorityTextColors[p] : 'text-gray-400'}`}>
                    {p === 'high' ? '🔴' : p === 'medium' ? '🟠' : '🟢'} {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <DatePicker
            label="Due Date"
            value={dueDate}
            onChange={setDueDate}
          />

          {/* Assign to employee */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign To</Text>
            <View className="flex-row flex-wrap gap-2">
              <TouchableOpacity
                onPress={() => setAssignedTo(null)}
                className={`px-3 py-2 rounded-xl border ${assignedTo === null ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
              >
                <Text className={assignedTo === null ? 'text-white text-sm font-medium' : 'text-gray-600 dark:text-gray-300 text-sm'}>
                  Unassigned
                </Text>
              </TouchableOpacity>
              {employees.map(emp => (
                <TouchableOpacity
                  key={emp.id}
                  onPress={() => setAssignedTo(emp.id)}
                  className={`px-3 py-2 rounded-xl border ${assignedTo === emp.id ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}
                >
                  <Text className={assignedTo === emp.id ? 'text-white text-sm font-medium' : 'text-gray-600 dark:text-gray-300 text-sm'}>
                    👤 {emp.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button title="Create Task" onPress={handleCreate} loading={loading} size="lg" className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
