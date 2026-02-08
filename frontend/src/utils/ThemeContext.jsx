import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      console.log('Initial theme from localStorage:', saved);
      return saved === 'dark';
    }
    return true;
  });

  useEffect(() => {
    console.log('Theme changed to:', isDark ? 'dark' : 'light');
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Added dark class to html');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Removed dark class from html');
    }
  }, [isDark]);

  const toggleTheme = () => {
    console.log('toggleTheme called, current isDark:', isDark);
    setIsDark(prev => {
      console.log('Setting isDark from', prev, 'to', !prev);
      return !prev;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};