import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary:   { btn: 'bg-blue-600 active:bg-blue-700',   text: 'text-white' },
  secondary: { btn: 'bg-gray-100 active:bg-gray-200 border border-gray-300', text: 'text-gray-700' },
  danger:    { btn: 'bg-red-600 active:bg-red-700',     text: 'text-white' },
  ghost:     { btn: 'bg-transparent',                   text: 'text-blue-600' },
};

const sizes = {
  sm: { btn: 'px-3 py-1.5', text: 'text-sm' },
  md: { btn: 'px-4 py-2.5', text: 'text-base' },
  lg: { btn: 'px-6 py-3',   text: 'text-lg' },
};

export function Button({ title, variant = 'primary', size = 'md', loading, disabled, className, ...props }: ButtonProps & { className?: string }) {
  const v = variants[variant];
  const s = sizes[size];
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      className={`rounded-xl flex-row items-center justify-center ${v.btn} ${s.btn} ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
      disabled={isDisabled}
      {...props}
    >
      {loading && <ActivityIndicator size="small" color={variant === 'secondary' ? '#374151' : '#fff'} className="mr-2" />}
      <Text className={`font-semibold ${v.text} ${s.text}`}>{title}</Text>
    </TouchableOpacity>
  );
}
