'use client';

import { useQuery } from '@tanstack/react-query';
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client';
import { useAuthStore } from '@/lib/store/auth-store';

export interface SellerProfile {
  id: string;
  name: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
  // Add other fields as needed
}

// Separate sentinel to distinguish auth failure from profile-not-found
class AuthError extends Error {}

async function fetchSellerProfile(): Promise<SellerProfile | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  if (!token) {
    throw new AuthError('No token');
  }

  const headers = await buildStoreHeaders(token);
  const response = await fetch(`${getBackendUrl()}/store/sellers/me`, {
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    throw new AuthError('Unauthorized');
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch seller profile');
  }

  const data = await response.json();
  return data.seller;
}

import { useState, useEffect } from 'react';

export function useSellerProfile() {
  const [mounted, setMounted] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: seller, isLoading, error } = useQuery({
    queryKey: ['sellerProfile'],
    queryFn: fetchSellerProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: typeof window !== 'undefined',
    retry: (failureCount, err) =>
      // Don't retry auth errors — they won't recover without re-login
      !(err instanceof AuthError) && failureCount < 2,
  });

  // If the profile fetch failed with an auth error, clear the session immediately
  useEffect(() => {
    if (error instanceof AuthError) {
      logout();
    }
  }, [error, logout]);

  const isAuthError = error instanceof AuthError;

  return {
    seller,
    isLoading: !mounted || isLoading,
    error,
    isAuthError,
    isVerified: seller?.verification_status === 'verified',
    isPending: seller?.verification_status === 'pending',
    isRejected: seller?.verification_status === 'rejected',
    isSuspended: seller?.verification_status === 'suspended',
    hasProfile: !!seller,
  };
}
