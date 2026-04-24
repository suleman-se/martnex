'use client';

import { useQuery } from '@tanstack/react-query';
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client';

export interface SellerProfile {
  id: string;
  name: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'suspended';
  // Add other fields as needed
}

async function fetchSellerProfile(): Promise<SellerProfile | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const headers = await buildStoreHeaders(token);
  const response = await fetch(`${getBackendUrl()}/store/sellers/me`, {
    headers,
  });

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
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: seller, isLoading, error } = useQuery({
    queryKey: ['sellerProfile'],
    queryFn: fetchSellerProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: typeof window !== 'undefined',
  });

  return {
    seller,
    isLoading: !mounted || isLoading,
    error,
    isVerified: seller?.verification_status === 'verified',
    isPending: seller?.verification_status === 'pending',
    isRejected: seller?.verification_status === 'rejected',
    isSuspended: seller?.verification_status === 'suspended',
    hasProfile: !!seller,
  };
}
