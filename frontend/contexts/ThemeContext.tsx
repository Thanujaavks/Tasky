import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';
type Scheme = 'light' | 'dark';

function readOsScheme(): Scheme {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  // Track the real OS scheme so we can restore it when user picks 'system'
  const [osScheme, setOsScheme] = useState<Scheme>(readOsScheme());

  useEffect(() => {
    AsyncStorage.getItem('themeMode').then(saved => {
      if (saved === 'light' || saved === 'dark') {
        setThemeModeState(saved);
        Appearance.setColorScheme(saved);
      } else if (saved === 'system') {
        setThemeModeState('system');
        // Don't override — let the OS drive dark: styles naturally
      }
    });

    // Track OS theme changes (fires even when app has overridden the scheme)
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setOsScheme(colorScheme === 'dark' ? 'dark' : 'light');
    });
    return () => sub.remove();
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem('themeMode', mode);
    if (mode === 'light' || mode === 'dark') {
      Appearance.setColorScheme(mode);
    } else {
      // 'system': restore current OS scheme — never pass null (crashes Android)
      Appearance.setColorScheme(osScheme);
    }
  };

  const toggleTheme = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  const isDark = themeMode === 'dark' || (themeMode === 'system' && osScheme === 'dark');

  return (
    <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
