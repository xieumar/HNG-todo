import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../constants/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem('theme').then(saved => {
      if (saved === 'dark' || saved === 'light') setMode(saved);
    });
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    await AsyncStorage.setItem('theme', newMode);
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};