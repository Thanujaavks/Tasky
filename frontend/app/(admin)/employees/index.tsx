import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const scrollRef = useRef<ScrollView>(null);
  const [employees, setEmployees] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '' });
  const [creating, setCreating] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const validateForm = () => {
    const errors: Partial<Record<keyof typeof form, string>> = {};
    if (!form.name.trim()) errors.name = 'Full name is required';
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Enter a valid email address';
    }
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (form.phone && !/^[+\d\s\-()]{7,20}$/.test(form.phone)) {
      errors.phone = 'Enter a valid phone number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
    if (!validateForm()) return;
    setCreating(true);
    try {
      await api.createEmployee(form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', department: '', phone: '' });
      setFormErrors({});
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
          try {
            await api.deleteEmployee(id);
            setEmployees(prev => prev.filter(e => e.id !== id));
          } catch (err: any) {
            Alert.alert('Error', err.message ?? 'Failed to deactivate employee');
          }
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
          {showForm ? (
            <TouchableOpacity
              onPress={() => { setShowForm(false); setFormErrors({}); }}
              className="bg-gray-200 dark:bg-gray-600 rounded-xl px-3 py-2"
            >
              <Text className="text-gray-700 dark:text-white text-sm font-semibold">✕ Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setShowForm(true);
                scrollRef.current?.scrollTo({ y: 0, animated: true });
              }}
              className="bg-blue-600 rounded-xl px-3 py-2"
            >
              <Text className="text-white text-sm font-semibold">+ Add Employee</Text>
            </TouchableOpacity>
          )}
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
        ref={scrollRef}
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
            ].map(field => {
              const fieldKey = field.key as keyof typeof form;
              const error = formErrors[fieldKey];
              return (
                <View key={field.key} className="mb-3">
                  <Text className="text-xs font-medium text-gray-500 mb-1">{field.label}</Text>
                  <TextInput
                    value={form[fieldKey]}
                    onChangeText={v => {
                      setForm(f => ({ ...f, [field.key]: v }));
                      if (error) setFormErrors(e => ({ ...e, [field.key]: undefined }));
                    }}
                    placeholder={field.placeholder}
                    placeholderTextColor="#9ca3af"
                    keyboardType={field.keyboard as any}
                    secureTextEntry={field.key === 'password'}
                    autoCapitalize="none"
                    className={`bg-gray-50 dark:bg-gray-700 border rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}
                  />
                  {error && (
                    <Text className="text-xs text-red-500 mt-1">{error}</Text>
                  )}
                </View>
              );
            })}
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
              ? Math.round((emp.completed_tasks / emp.total_tasks) * 100) : 0;
            return (
              <View key={emp.id} className="mb-3" style={{ position: 'relative' }}>
                <TouchableOpacity
                  onPress={() => router.push(`/(admin)/employees/${emp.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center mb-3" style={{ paddingRight: 32 }}>
                    <View className="w-12 h-12 rounded-full items-center justify-center bg-blue-500 mr-3">
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

                  {/* Task stats */}
                  <View className="flex-row gap-2 mb-2">
                    {[
                      { label: 'Total', value: emp.total_tasks, color: 'text-gray-700' },
                      { label: 'Done', value: emp.completed_tasks, color: 'text-green-600' },
                      { label: 'Active', value: emp.in_progress_tasks, color: 'text-blue-600' },
                      { label: 'Pending', value: emp.pending_tasks, color: 'text-amber-600' },
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

                {/* Deactivate button — outside the card's TouchableOpacity to avoid event conflict */}
                <TouchableOpacity
                  onPress={() => handleDeactivate(emp.id, emp.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ position: 'absolute', top: 12, right: 12, padding: 8 }}
                >
                  <Text className="text-gray-400 text-lg">⋮</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
