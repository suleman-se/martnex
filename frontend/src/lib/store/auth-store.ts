import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, RegisterResponse, ApiError } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9001';
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
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
          let userData: any = { user_id: 'unknown', email, role: 'buyer' };
          
          if (token) {
            const meResponse = await fetch(`${API_URL}/store/customers/me`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'x-publishable-api-key': PUBLISHABLE_KEY,
              }
            });
            
            if (meResponse.ok) {
              const meData = await meResponse.json();
              if (meData.customer) {
                userData = {
                  user_id: meData.customer.id,
                  email: meData.customer.email,
                  role: 'buyer',
                  first_name: meData.customer.first_name,
                  last_name: meData.customer.last_name
                };
              }
            }
          }

          // Set user
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
        try {
          const token = localStorage.getItem('access_token');
          if (token) {
            await fetch(`${API_URL}/auth/customer/emailpass`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear local state
          localStorage.removeItem('access_token');
          set({ user: null, isAuthenticated: false });
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
