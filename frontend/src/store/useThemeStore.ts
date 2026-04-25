import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 
  | 'light' 
  | 'dark' 
  | 'animated-dark'
  | 'solo-leveling' 
  | 'one-piece' 
  | 'batman' 
  | 'nature-sea' 
  | 'nature-hill' 
  | 'nature-mountain' 
  | 'nature-river' 
  | 'nature-waterfall';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        document.documentElement.setAttribute('data-theme', newTheme);
      },
    }),
    {
      name: 'app-theme',
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('app-theme');
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme);
      document.documentElement.setAttribute('data-theme', parsed.state.theme);
    } catch (e) {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}
