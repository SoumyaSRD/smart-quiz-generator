import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeType = 
  | 'light' 
  | 'dark' 
  | 'solo-leveling' 
  | 'one-piece' 
  | 'batman' 
  | 'nature-sea' 
  | 'nature-hill' 
  | 'nature-mountain' 
  | 'nature-river' 
  | 'nature-waterfall';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('app-theme') as ThemeType;
    return saved || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
};
