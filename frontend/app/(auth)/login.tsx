import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  Text, TouchableOpacity, View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function Login() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  if (user) {
    return <Redirect href={user.role === 'admin' ? '/(admin)/dashboard' : '/(employee)/dashboard'} />;
  }

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'admin' | 'employee') => {
    if (role === 'admin') {
      setEmail('admin@taskly.com');
      setPassword('Admin@123');
    } else {
      setEmail('alice@taskly.com');
      setPassword('Employee@123');
    }
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="bg-blue-600 pt-16 pb-12 px-6 rounded-b-3xl items-center">
          <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center mb-4 shadow-lg">
            <Text className="text-4xl">✅</Text>
          </View>
          <Text className="text-3xl font-bold text-white">Taskly</Text>
          <Text className="text-blue-200 mt-1 text-base">Employee Task Management</Text>
        </View>

        {/* Form */}
        <View className="flex-1 px-6 pt-8 pb-6">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</Text>
          <Text className="text-gray-500 dark:text-gray-400 mb-8">Sign in to continue</Text>

          <Input
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={errors.email}
            leftIcon={<Text className="text-lg">📧</Text>}
          />

          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            // secureTextEntry={!showPassword}
            error={errors.password}
            leftIcon={<Text className="text-lg">🔒</Text>}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                <Text className="text-lg">{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            }
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            className="mt-2 w-full"
            size="lg"
          />

          {/* Demo Accounts */}
          <View className="mt-8">
            <Text className="text-center text-sm text-gray-400 mb-3">— Demo Accounts —</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => fillDemo('admin')}
                className="flex-1 border border-blue-200 dark:border-blue-800 rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20 items-center"
              >
                <Text className="text-lg mb-1">👑</Text>
                <Text className="text-sm font-semibold text-blue-700 dark:text-blue-400">Admin</Text>
                <Text className="text-xs text-gray-400">admin@taskly.com</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => fillDemo('employee')}
                className="flex-1 border border-green-200 dark:border-green-800 rounded-xl p-3 bg-green-50 dark:bg-green-900/20 items-center"
              >
                <Text className="text-lg mb-1">👤</Text>
                <Text className="text-sm font-semibold text-green-700 dark:text-green-400">Employee</Text>
                <Text className="text-xs text-gray-400">alice@taskly.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
