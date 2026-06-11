import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </Provider>
  );
}
