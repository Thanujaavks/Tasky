import React from 'react';
import { Text, View } from 'react-native';

type Variant = 'pending' | 'in_progress' | 'completed' | 'high' | 'medium' | 'low';

const config: Record<Variant, { bg: string; text: string; label: string }> = {
  pending:     { bg: 'bg-amber-100',  text: 'text-amber-700',  label: 'Pending' },
  in_progress: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'In Progress' },
  completed:   { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed' },
  high:        { bg: 'bg-red-100',    text: 'text-red-700',    label: 'High' },
  medium:      { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Medium' },
  low:         { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Low' },
};

export function Badge({ variant }: { variant: Variant }) {
  const c = config[variant];
  return (
    <View className={`px-2.5 py-0.5 rounded-full ${c.bg}`}>
      <Text className={`text-xs font-semibold ${c.text}`}>{c.label}</Text>
    </View>
  );
}
