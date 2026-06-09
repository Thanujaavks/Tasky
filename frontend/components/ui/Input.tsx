import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, rightIcon, className, ...props }: InputProps & { className?: string }) {
  return (
    <View className="mb-4">
      {label && <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</Text>}
      <View className={`flex-row items-center bg-white dark:bg-gray-800 border rounded-xl px-3 ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'}`}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={`flex-1 py-3 text-base text-gray-900 dark:text-white ${className ?? ''}`}
          placeholderTextColor="#9ca3af"
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}
