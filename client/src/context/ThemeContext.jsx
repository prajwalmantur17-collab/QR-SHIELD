import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (!localStorage.getItem('qrshield_saas_light_v1')) {
      localStorage.setItem('qrshield_theme', 'light');
      localStorage.setItem('qrshield_saas_light_v1', '1');
      return 'light';
    }
    const saved = localStorage.getItem('qrshield_theme');
    if (saved === 'dark') return 'dark';
    return 'light'; // Default to light mode (Premium SaaS #F7F8F6 / #FFFFFF / #167D73)
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('qrshield_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
