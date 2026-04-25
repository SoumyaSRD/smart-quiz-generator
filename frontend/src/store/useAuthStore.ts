import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface User {
  username: string;
  full_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  setDemoMode: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isDemoMode: false,
      login: async (username, password) => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
          const response = await axios.post(`${API_BASE_URL}/api/token`, formData);
          const { access_token } = response.data;
          
          // Get user info
          const userResponse = await axios.get(`${API_BASE_URL}/api/me`, {
            headers: { Authorization: `Bearer ${access_token}` }
          });

          set({ 
            user: userResponse.data, 
            token: access_token,
            isAuthenticated: true, 
            isDemoMode: false 
          });
        } catch (error) {
          throw error;
        }
      },
      register: async (username, password, fullName) => {
        try {
          await axios.post(`${API_BASE_URL}/api/register`, {
            username,
            password,
            full_name: fullName
          });
        } catch (error) {
          throw error;
        }
      },
      logout: () => set({ 
        user: null, 
        token: null,
        isAuthenticated: false, 
        isDemoMode: false 
      }),
      setDemoMode: (val) => set({ 
        isDemoMode: val,
        isAuthenticated: false,
        user: null,
        token: null
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
