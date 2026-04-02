import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const lightTheme = {
  mode: 'light',
  bg:           '#FFFFFF',
  bgSecondary:  '#F5F5F5',
  surface:      '#FFFFFF',
  card:         '#F0F4FF',
  border:       '#E0E0E0',
  text:         '#111111',
  textSecondary:'rgba(0,0,0,0.55)',
  textMuted:    'rgba(0,0,0,0.35)',
  accent:       '#1A56DB',
  accentBg:     '#EBF1FF',
  accentBorder: '#B8CFFF',
  inputBg:      '#FFFFFF',
  inputLine:    '#BDBDBD',
  scoreHigh:    '#16A34A',
  scoreMid:     '#D97706',
  scoreLow:     '#DC2626',
};

export const darkTheme = {
  mode: 'dark',
  bg:           '#0A0F1E',
  bgSecondary:  '#111827',
  surface:      '#111827',
  card:         '#162040',
  border:       '#1A2E5C',
  text:         '#F0EEF8',
  textSecondary:'#A8B4CC',
  textMuted:    '#5A6A82',
  accent:       '#4D7FFF',
  accentBg:     '#0D1E4D',
  accentBorder: '#1A3A8F',
  inputBg:      '#111827',
  inputLine:    '#2E3347',
  scoreHigh:    '#22C55E',
  scoreMid:     '#FBBF24',
  scoreLow:     '#EF4444',
};

export function ThemeProvider({ children }) {
  const systemScheme  = useColorScheme(); // 'light' | 'dark'
  const [override, setOverride] = useState(null); // null = follow system

  useEffect(() => {
    AsyncStorage.getItem('themeOverride').then((val) => {
      if (val === 'light' || val === 'dark') setOverride(val);
    });
  }, []);

  const scheme = override ?? systemScheme ?? 'light';
  const theme  = scheme === 'dark' ? darkTheme : lightTheme;

  const setTheme = async (val) => {
    // val: 'light' | 'dark' | 'system'
    if (val === 'system') {
      setOverride(null);
      await AsyncStorage.removeItem('themeOverride');
    } else {
      setOverride(val);
      await AsyncStorage.setItem('themeOverride', val);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, scheme, setTheme, override }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
