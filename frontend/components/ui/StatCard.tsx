import React from 'react';
import { Text, View } from 'react-native';

interface StatCardProps {
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
  icon: string;
}

export function StatCard({ label, value, color, bgColor, icon }: StatCardProps) {
  return (
    <View className={`${bgColor} rounded-2xl p-4 flex-1`}>
      <Text className="text-2xl mb-1">{icon}</Text>
      <Text className={`text-2xl font-bold ${color}`}>{value}</Text>
      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</Text>
    </View>
  );
}
