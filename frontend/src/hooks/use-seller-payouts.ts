'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PayoutStatus =
  | 'requested'
  | 'pending_review'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface SellerPayout {
  id: string
  seller_id: string
  amount: number
  currency_code: string
  status: PayoutStatus
  commission_ids: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface PayoutStats {
  totalRequested: number
  totalCount: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatPayoutStatus(status: PayoutStatus): string {
  const map: Record<PayoutStatus, string> = {
    requested: 'Requested',
    pending_review: 'In Review',
    approved: 'Approved',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  }
  return map[status] ?? status
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchPayouts(): Promise<{ payouts: SellerPayout[]; stats: PayoutStats }> {
  const token = localStorage.getItem('access_token')
  const headers = await buildStoreHeaders(token ?? undefined)
  const res = await fetch(`${getBackendUrl()}/store/payouts?limit=50`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch payouts')
  const data = await res.json()
  return {
    payouts: data.payouts ?? [],
    stats: data.stats ?? { totalRequested: 0, totalCount: 0 },
  }
}

async function requestPayout(body: {
  commission_ids: string[]
  amount: number
}): Promise<SellerPayout> {
  const token = localStorage.getItem('access_token')
  const headers = await buildStoreHeaders(token ?? undefined)
  const res = await fetch(`${getBackendUrl()}/store/payouts`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? 'Failed to request payout')
  }
  const data = await res.json()
  return data.payout
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSellerPayouts() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['seller-payouts'],
    queryFn: fetchPayouts,
    staleTime: 30_000,
  })

  return {
    payouts: data?.payouts ?? [],
    stats: data?.stats ?? { totalRequested: 0, totalCount: 0 },
    isLoading,
    error,
    refetch,
  }
}

export function useRequestPayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-payouts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
