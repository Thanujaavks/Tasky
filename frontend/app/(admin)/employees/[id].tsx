import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEmployee, updateEmployee } from '@/store/slices/employeeSlice';
import { fetchTasks } from '@/store/slices/taskSlice';
import { TaskCard } from '@/components/TaskCard';
import { Task } from '@/types';

export default function EmployeeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const employee = useAppSelector(s => s.employees.currentEmployee);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const initialized = useRef(false);

  useEffect(() => {
    Promise.all([
      dispatch(fetchEmployee(Number(id))).unwrap(),
      dispatch(fetchTasks({ assigned_to: id })).unwrap(),
    ]).then(([emp, taskList]) => {
      setTasks(taskList);
    }).catch((err: any) => Alert.alert('Error', err.message))
      .finally(() => setLoading(false));
  }, [id, dispatch]);

  useEffect(() => {
    if (employee && !initialized.current) {
      setName(employee.name);
      setDepartment(employee.department || '');
      setPhone(employee.phone || '');
      initialized.current = true;
    }
  }, [employee]);

  const handleStartEditing = () => {
    if (employee) {
      setName(employee.name);
      setDepartment(employee.department || '');
      setPhone(employee.phone || '');
    }
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateEmployee({ id: Number(id), data: { name, department, phone } })).unwrap();
      setEditing(false);
      Alert.alert('Success', 'Employee updated');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }
  if (!employee) return null;

  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  };
  const completion = taskCounts.total > 0 ? Math.round((taskCounts.completed / taskCounts.total) * 100) : 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-blue-600">← Back</Text>
        </TouchableOpacity>
        <Text className="font-bold text-gray-900 dark:text-white">Employee</Text>
        <TouchableOpacity onPress={editing ? () => setEditing(false) : handleStartEditing}>
          <Text className="text-blue-600 text-sm font-medium">{editing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profile card */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm mb-4 items-center">
          <View className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center mb-3">
            <Text className="text-white text-3xl font-bold">{employee.name.charAt(0).toUpperCase()}</Text>
          </View>

          {editing ? (
            <View className="w-full">
              {[
                { label: 'Name', value: name, setter: setName },
                { label: 'Department', value: department, setter: setDepartment },
                { label: 'Phone', value: phone, setter: setPhone },
              ].map(f => (
                <View key={f.label} className="mb-3">
                  <Text className="text-xs text-gray-500 mb-1">{f.label}</Text>
                  <TextInput
                    value={f.value}
                    onChangeText={f.setter}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              ))}
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className={`bg-blue-600 rounded-xl py-3 items-center ${saving ? 'opacity-50' : ''}`}
              >
                <Text className="text-white font-semibold">{saving ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-1">{employee.name}</Text>
              <Text className="text-gray-400 text-sm mb-1">{employee.email}</Text>
              {employee.department && <Text className="text-blue-500 text-sm">🏢 {employee.department}</Text>}
              {employee.phone && <Text className="text-gray-400 text-sm mt-1">📞 {employee.phone}</Text>}
            </>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-4">
          {[
            { label: 'Total', value: taskCounts.total, bg: 'bg-gray-100', color: 'text-gray-700' },
            { label: 'Done', value: taskCounts.completed, bg: 'bg-green-100', color: 'text-green-700' },
            { label: 'Active', value: taskCounts.in_progress, bg: 'bg-blue-100', color: 'text-blue-700' },
          ].map(s => (
            <View key={s.label} className={`flex-1 ${s.bg} rounded-2xl p-3 items-center`}>
              <Text className={`text-2xl font-bold ${s.color}`}>{s.value}</Text>
              <Text className="text-xs text-gray-500">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress */}
        {taskCounts.total > 0 && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">Completion Rate</Text>
              <Text className="text-sm font-bold text-blue-600">{completion}%</Text>
            </View>
            <View className="bg-gray-100 dark:bg-gray-700 rounded-full h-3">
              <View className="bg-blue-500 rounded-full h-3" style={{ width: `${completion}%` }} />
            </View>
          </View>
        )}

        {/* Tasks */}
        <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Assigned Tasks</Text>
        {tasks.length === 0 ? (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 items-center">
            <Text className="text-gray-400">No tasks assigned</Text>
          </View>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={() => router.push(`/(admin)/tasks/${task.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
