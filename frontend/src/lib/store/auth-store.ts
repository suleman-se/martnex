import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse, RegisterResponse, ApiError } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'buyer' | 'seller';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error: ApiError = await response.json();
            throw new Error(error.error || error.message);
          }

          const data: LoginResponse = await response.json();

          // Store tokens in localStorage
          localStorage.setItem('access_token', data.data.access_token);
          localStorage.setItem('refresh_token', data.data.refresh_token);

          // Set user
          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });

          // Setup auto-refresh (14 minutes - 1 minute before expiration)
          setTimeout(() => {
            get().refreshToken();
          }, 14 * 60 * 1000);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (registerData: RegisterData) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData),
          });

          if (!response.ok) {
            const error: ApiError = await response.json();
            throw new Error(error.error || error.message);
          }

          const data: RegisterResponse = await response.json();
          set({ isLoading: false });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            await fetch(`${API_URL}/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local state
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false });
        }
      },

      refreshToken: async () => {
        try {
          const refreshTokenValue = localStorage.getItem('refresh_token');
          if (!refreshTokenValue) {
            throw new Error('No refresh token');
          }

          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshTokenValue }),
          });

          if (!response.ok) {
            throw new Error('Token refresh failed');
          }

          const data: LoginResponse = await response.json();

          // Update tokens
          localStorage.setItem('access_token', data.data.access_token);
          localStorage.setItem('refresh_token', data.data.refresh_token);

          // Update user
          set({ user: data.data.user, isAuthenticated: true });

          // Setup next refresh
          setTimeout(() => {
            get().refreshToken();
          }, 14 * 60 * 1000);
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Clear tokens and user
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
