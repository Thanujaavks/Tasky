import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreSession } from '@/store/slices/authSlice';

export default function Index() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(s => s.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
  return <Redirect href="/(employee)/dashboard" />;
}
