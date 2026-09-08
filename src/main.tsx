import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyThemeToDocument, THEME_STORAGE_KEY } from './context/ThemeContext';

// Ensure dark theme is initialized and applied to the DOM before React renders
try {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  const theme = saved === 'light' ? 'light' : 'dark';
  applyThemeToDocument(theme);
} catch (e) {
  applyThemeToDocument('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
