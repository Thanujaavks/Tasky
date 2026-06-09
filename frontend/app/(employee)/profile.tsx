import React, { useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setLoading(true);
    try {
      await api.updateProfile({ name: name.trim(), department, phone });
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.updateProfile({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      Alert.alert('Success', 'Password changed successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {/* Avatar header */}
          <View className="items-center mb-6 pt-4">
            <View className="w-24 h-24 rounded-full bg-emerald-500 items-center justify-center mb-3 shadow-lg">
              <Text className="text-white text-4xl font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</Text>
            <Text className="text-gray-400 text-sm">{user?.email}</Text>
            <View className="flex-row items-center gap-2 mt-2">
              <View className="bg-emerald-100 dark:bg-emerald-900 rounded-full px-3 py-1">
                <Text className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold capitalize">
                  👤 {user?.role}
                </Text>
              </View>
              {user?.department && (
                <View className="bg-blue-100 dark:bg-blue-900 rounded-full px-3 py-1">
                  <Text className="text-blue-700 dark:text-blue-400 text-xs">🏢 {user.department}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Edit profile */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-4">Edit Profile</Text>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              leftIcon={<Text>👤</Text>}
            />
            <Input
              label="Department"
              value={department}
              onChangeText={setDepartment}
              placeholder="Your department"
              leftIcon={<Text>🏢</Text>}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+1-555-0000"
              keyboardType="phone-pad"
              leftIcon={<Text>📞</Text>}
            />
            <Button
              title="Save Profile"
              onPress={handleSaveProfile}
              loading={loading}
              className="mt-1"
            />
          </View>

          {/* Change password */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
            <TouchableOpacity
              onPress={() => setShowPasswordForm(p => !p)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-base font-bold text-gray-900 dark:text-white">Change Password</Text>
              <Text className="text-gray-400">{showPasswordForm ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showPasswordForm && (
              <View className="mt-4">
                <Input
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  placeholder="Current password"
                  leftIcon={<Text>🔒</Text>}
                />
                <Input
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="New password (min 6 chars)"
                  leftIcon={<Text>🔑</Text>}
                />
                <Input
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm new password"
                  leftIcon={<Text>🔑</Text>}
                />
                <Button
                  title="Update Password"
                  onPress={handleChangePassword}
                  loading={loading}
                  variant="secondary"
                />
              </View>
            )}
          </View>

          {/* Account info */}
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm mb-4">
            <Text className="text-base font-bold text-gray-900 dark:text-white mb-3">Account Info</Text>
            {[
              { label: 'Email', value: user?.email },
              { label: 'Role', value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '' },
              { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '' },
            ].map(item => (
              <View key={item.label} className="flex-row justify-between py-2.5 border-b border-gray-50 dark:border-gray-700 last:border-0">
                <Text className="text-sm text-gray-500 dark:text-gray-400">{item.label}</Text>
                <Text className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Logout */}
          <Button
            title="Logout"
            variant="danger"
            onPress={handleLogout}
            className="mb-8"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
