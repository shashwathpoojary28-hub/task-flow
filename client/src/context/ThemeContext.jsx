import React, { createContext, useContext, useEffect, useState } from 'react';
import { sounds } from '../utils/sound';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Theme state (dark / light)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('taskflow_theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Sound effects state
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('taskflow_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('taskflow_theme', theme);
  }, [theme]);

  useEffect(() => {
    sounds.toggleSound(soundEnabled);
    localStorage.setItem('taskflow_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', soundEnabled, toggleSound }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
