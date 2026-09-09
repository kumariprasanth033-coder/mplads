import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEME_STORAGE_KEY = 'mplads-theme';

/**
 * Applies theme classes and attributes directly to DOM root elements
 * to guarantee no light-theme flash occurs and the styling is immediate.
 */
export const applyThemeToDocument = (_theme: ThemeMode = 'dark') => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('light');
  root.classList.add('dark');
  root.setAttribute('data-theme', 'dark');
  root.style.colorScheme = 'dark';
  root.style.backgroundColor = '#0f172a';

  if (document.body) {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.color = '#f1f5f9';
  }

  const rootDiv = document.getElementById('root');
  if (rootDiv) {
    rootDiv.style.backgroundColor = '#0f172a';
    rootDiv.style.color = '#f1f5f9';
  }
};

/**
 * Global Theme Provider for MPLADS Smart & AI Portal
 * Default Theme: DARK (Consistent before, during, and after login across every route)
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // The dark MPLADS theme is the SINGLE global theme for every route before & after login
  const theme: ThemeMode = 'dark';

  useEffect(() => {
    applyThemeToDocument('dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } catch (e) {
      // Ignore localStorage quotas/issues
    }
  }, []);

  const setTheme = (_newTheme: ThemeMode) => {
    // Keep single uniform dark theme
    applyThemeToDocument('dark');
  };

  const toggleTheme = () => {
    // Keep single uniform dark theme
    applyThemeToDocument('dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
