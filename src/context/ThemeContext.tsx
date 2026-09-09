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
 * to guarantee no light-theme flash occurs and the dark styling is permanent.
 */
export const applyThemeToDocument = (_theme?: ThemeMode) => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('light');
  root.classList.add('dark');
  root.setAttribute('data-theme', 'dark');
  root.style.colorScheme = 'dark';

  if (document.body) {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.color = '#f1f5f9';
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  } catch (e) {
    // Ignore localStorage quotas/issues
  }
};

/**
 * Global Theme Provider for MPLADS Smart & AI Portal
 * Standard: Modern Dark Slate Architecture (Ashoka National Portal Palette)
 * Single global theme before, during, and after login across all routes.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme] = useState<ThemeMode>('dark');

  useEffect(() => {
    applyThemeToDocument('dark');
  }, []);

  const setTheme = (_newTheme: ThemeMode) => {
    // Portal standard mandates single dark theme
    applyThemeToDocument('dark');
  };

  const toggleTheme = () => {
    applyThemeToDocument('dark');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: 'dark',
        setTheme,
        toggleTheme,
        isDark: true,
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

