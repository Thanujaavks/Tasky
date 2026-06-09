import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, RefreshControl, ScrollView,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { EmployeeStats } from '@/types';

export default function AdminEmployees() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '' });
  const [creating, setCreating] = useState(false);

  const loadEmployees = useCallback(async () => {
    try {
      const res = await api.getEmployees();
      setEmployees(res.employees);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadEmployees();
  }, [loadEmployees]);

  const filtered = search
    ? employees.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        (e.department || '').toLowerCase().includes(search.toLowerCase())
      )
    : employees;

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Name, email and password are required');
      return;
    }
    setCreating(true);
    try {
      await api.createEmployee(form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', department: '', phone: '' });
      loadEmployees();
      Alert.alert('Success', 'Employee created');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = (id: number, name: string) => {
    Alert.alert('Deactivate Employee', `Deactivate ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate', style: 'destructive',
        onPress: async () => {
          await api.deleteEmployee(id);
          loadEmployees();
        },
      },
    ]);
  };

  if (loading) {
    return <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 pt-4 pb-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Team ({employees.length})</Text>
          <TouchableOpacity
            onPress={() => setShowForm(f => !f)}
            className="bg-blue-600 rounded-xl px-3 py-2"
          >
            <Text className="text-white text-sm font-semibold">{showForm ? '✕ Cancel' : '+ Add Employee'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
          <Text className="mr-2">🔍</Text>
          <TextInput
            placeholder="Search employees..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            className="flex-1 text-gray-900 dark:text-white text-sm"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
        keyboardShouldPersistTaps="handled"
      >
        {/* Create Employee Form */}
        {showForm && (
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-4">New Employee</Text>
            {[
              { label: 'Full Name *', key: 'name', placeholder: 'John Doe', keyboard: 'default' },
              { label: 'Email *', key: 'email', placeholder: 'john@company.com', keyboard: 'email-address' },
              { label: 'Password *', key: 'password', placeholder: 'Secure password', keyboard: 'default' },
              { label: 'Department', key: 'department', placeholder: 'Engineering', keyboard: 'default' },
              { label: 'Phone', key: 'phone', placeholder: '+1-555-0100', keyboard: 'phone-pad' },
            ].map(field => (
              <View key={field.key} className="mb-3">
                <Text className="text-xs font-medium text-gray-500 mb-1">{field.label}</Text>
                <TextInput
                  value={form[field.key as keyof typeof form]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9ca3af"
                  keyboardType={field.keyboard as any}
                  secureTextEntry={field.key === 'password'}
                  autoCapitalize="none"
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                />
              </View>
            ))}
            <TouchableOpacity
              onPress={handleCreate}
              disabled={creating}
              className={`bg-blue-600 rounded-xl py-3 items-center mt-2 ${creating ? 'opacity-50' : ''}`}
            >
              <Text className="text-white font-semibold">{creating ? 'Creating...' : 'Create Employee'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Employee List */}
        {filtered.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-5xl mb-4">👥</Text>
            <Text className="text-gray-500 dark:text-gray-400">No employees found</Text>
          </View>
        ) : (
          filtered.map(emp => {
            const completion = emp.total_tasks > 0
              ? Math.round((emp.completed / emp.total_tasks) * 100) : 0;
            return (
              <TouchableOpacity
                key={emp.id}
                onPress={() => router.push(`/(admin)/employees/${emp.id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 items-center justify-center bg-blue-500">
                      <Text className="text-white text-lg font-bold">
                        {emp.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 dark:text-white">{emp.name}</Text>
                      <Text className="text-xs text-gray-400">{emp.email}</Text>
                      {emp.department && (
                        <Text className="text-xs text-blue-500 mt-0.5">🏢 {emp.department}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeactivate(emp.id, emp.name)}
                    className="p-2"
                  >
                    <Text className="text-gray-400">⋮</Text>
                  </TouchableOpacity>
                </View>

                {/* Task stats */}
                <View className="flex-row gap-2 mb-2">
                  {[
                    { label: 'Total', value: emp.total_tasks, color: 'text-gray-700' },
                    { label: 'Done', value: emp.completed, color: 'text-green-600' },
                    { label: 'Active', value: emp.in_progress, color: 'text-blue-600' },
                    { label: 'Pending', value: emp.pending, color: 'text-amber-600' },
                  ].map(s => (
                    <View key={s.label} className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 items-center">
                      <Text className={`text-base font-bold ${s.color}`}>{s.value}</Text>
                      <Text className="text-xs text-gray-400">{s.label}</Text>
                    </View>
                  ))}
                </View>

                {emp.total_tasks > 0 && (
                  <>
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-xs text-gray-400">Completion</Text>
                      <Text className="text-xs font-semibold text-blue-600">{completion}%</Text>
                    </View>
                    <View className="bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <View className="bg-blue-500 rounded-full h-1.5" style={{ width: `${completion}%` }} />
                    </View>
                  </>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
