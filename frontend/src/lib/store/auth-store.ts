import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, RegisterResponse, ApiError } from '@/types/auth';
import { buildStoreHeaders, getBackendUrl, medusa } from '@/lib/medusa-client';

const API_URL = getBackendUrl();

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setCredentials: (user: User, token: string) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
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
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setCredentials: (user, token) => {
        localStorage.setItem('access_token', token);
        set({ user, isAuthenticated: true });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          // Custom Martnex login endpoint with Redis refresh tokens
          const response = await fetch(`${API_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed. Please check your credentials.');
          }

          const data = await response.json();

          // Store tokens
          if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
          }
          if (data.refresh_token) {
            localStorage.setItem('refresh_token', data.refresh_token);
          }

          // Set user from response data
          const userData: User = {
            id: data.user.user_id,
            email: data.user.email,
            role: data.user.role,
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            email_verified: data.user.email_verified || false
          };

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
          });

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
            throw new Error(error.message || 'Registration failed');
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
        const refreshToken = localStorage.getItem('refresh_token');

        // 1. Clear local session state immediately
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, isAuthenticated: false });

        // 2. Clear custom backend session (Redis revocation)
        try {
          if (refreshToken) {
            await fetch(`${API_URL}/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
          }
        } catch (error) {
          console.debug('Custom session termination error:', error);
        }

        // 3. Clear native Medusa session
        try {
          await medusa.auth.logout();
        } catch (error) {
          console.debug('Native session termination error:', error);
        }
      },

      refreshSession: async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return;

        try {
          const response = await fetch(`${API_URL}/auth/token/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.access_token) {
              localStorage.setItem('access_token', data.access_token);
            }
            if (data.refresh_token) {
              localStorage.setItem('refresh_token', data.refresh_token);
            }
          } else {
            // If refresh fails, log out
            get().logout();
          }
        } catch (error) {
          console.error('Refresh session error:', error);
        }
      },

      refreshUser: async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) return;

          const headers = await buildStoreHeaders(token);
          const response = await fetch(`${API_URL}/store/customers/me`, {
            headers,
            cache: 'no-store',
            // @ts-ignore - Next.js specific
            next: { revalidate: 0 }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.customer) {
              const userData: User = {
                id: data.customer.id,
                email: data.customer.email,
                role: (data.customer.metadata?.role as any) || 'buyer',
                first_name: data.customer.first_name,
                last_name: data.customer.last_name,
                email_verified: !!data.customer.metadata?.email_verified
              };
              set({ user: userData, isAuthenticated: true });
            }
          }
        } catch (error) {
          console.error('Refresh user error:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error) {
            state?.setHasHydrated(true);
          }
        };
      },
    }
  )
);
