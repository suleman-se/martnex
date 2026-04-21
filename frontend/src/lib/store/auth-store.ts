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
          // Medusa v2 native auth endpoint
          const response = await fetch(`${API_URL}/auth/customer/emailpass`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Verification failed. Password incorrect or account does not exist.');
          }

          const data = await response.json();

          // Store native Medusa token
          const token = data.token;
          if (token) {
            localStorage.setItem('access_token', token);
          }

          // Fetch customer details from Medusa
          let userData: User | null = null;
          
          if (token) {
            const headers = await buildStoreHeaders(token);

            const meResponse = await fetch(`${API_URL}/store/customers/me`, {
              headers,
            });
            
            if (meResponse.ok) {
              const meData = await meResponse.json();
              if (meData.customer) {
                userData = {
                  id: meData.customer.id,
                  email: meData.customer.email,
                  role: (meData.customer.metadata?.role as any) || 'buyer',
                  first_name: meData.customer.first_name,
                  last_name: meData.customer.last_name,
                  email_verified: !!meData.customer.metadata?.email_verified
                };
              }
            }
          }

          // Set user
          set({
            user: userData,
            isAuthenticated: !!userData,
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
        // 1. Clear local session state immediately
        localStorage.removeItem('access_token');
        set({ user: null, isAuthenticated: false });

        // 2. Clear backend session using the official JS SDK
        try {
          // The SDK handles headers and session invalidation according to Medusa v2 standards
          await medusa.auth.logout();
        } catch (error) {
          // If the session is already gone or invalid, we ignore the error as local state is already wiped
          console.debug('Background session termination:', error);
        }
      },

      refreshUser: async () => {
        try {
          const token = localStorage.getItem('access_token');
          if (!token) return;

          const headers = await buildStoreHeaders(token);
          const response = await fetch(`${API_URL}/store/customers/me`, {
            headers,
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
