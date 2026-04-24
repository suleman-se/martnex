import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client';

export interface Seller {
  id: string;
  name: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_tax_id?: string;
  verification_status: string;
  created_at: string;
}

async function fetchPendingSellers(): Promise<Seller[]> {
  if (typeof window === 'undefined') return [];
  const token = localStorage.getItem('access_token');
  const headers = await buildStoreHeaders(token || undefined);
  const response = await fetch(`${getBackendUrl()}/admin/sellers?status=pending`, { headers });
  if (!response.ok) throw new Error('Could not establish connection to the Registry.');
  const data = await response.json();
  return data.sellers ?? [];
}

async function verifySeller(id: string): Promise<void> {
  const token = localStorage.getItem('access_token');
  const headers = await buildStoreHeaders(token || undefined);
  const response = await fetch(`${getBackendUrl()}/admin/sellers/${id}/verify`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes: 'Verified by Admin' }),
  });
  if (!response.ok) throw new Error('Verification failed');
}

async function rejectSeller(id: string, reason: string): Promise<void> {
  const token = localStorage.getItem('access_token');
  const headers = await buildStoreHeaders(token || undefined);
  const response = await fetch(`${getBackendUrl()}/admin/sellers/${id}/reject`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) throw new Error('Rejection failed');
}

/**
 * useAdminSellers
 *
 * Manages pending seller registry data for the admin panel.
 * Uses React Query for caching (30s stale) and optimistic removal on action.
 */
export function useAdminSellers() {
  const queryClient = useQueryClient();
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  const {
    data: sellers = [] as Seller[],
    isLoading,
    error,
  } = useQuery<Seller[]>({
    queryKey: ['adminPendingSellers'],
    queryFn: fetchPendingSellers,
    staleTime: 30 * 1000, // 30s — admin data refreshes more often
    enabled: typeof window !== 'undefined',
  });

  // Auto-select first seller when data loads (v5 compatible — no onSuccess)
  useEffect(() => {
    if (sellers.length > 0 && !selectedSellerId) {
      setSelectedSellerId(sellers[0].id);
    }
  }, [sellers, selectedSellerId]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminPendingSellers'] });

  const verifyMutation = useMutation({
    mutationFn: verifySeller,
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectSeller(id, reason),
    onSuccess: invalidate,
  });

  const selectedSeller = sellers.find((s) => s.id === selectedSellerId) ?? null;

  return {
    sellers,
    selectedSeller,
    setSelectedSellerId,
    isLoading,
    error: error ? String(error) : null,
    isProcessing: verifyMutation.isPending || rejectMutation.isPending,
    handleVerify: (id: string) => verifyMutation.mutate(id),
    handleReject: (id: string, reason: string) => rejectMutation.mutate({ id, reason }),
  };
}
