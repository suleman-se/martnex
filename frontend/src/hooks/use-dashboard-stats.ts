'use client'

import { useQuery } from '@tanstack/react-query'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'
import type { SellerOrder } from './use-seller-orders'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommissionStats {
  totalEarnings: number
  approvedAmount: number
  totalCount: number
}

interface CommissionResponse {
  stats: CommissionStats
}

export interface DashboardStats {
  totalRevenue: number
  approvedEarnings: number
  activeOrderCount: number
  totalCommissions: number
  currencyCode: string
  recentOrders: SellerOrder[]
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchDashboardData(): Promise<DashboardStats> {
  const token = localStorage.getItem('access_token')
  const headers = await buildStoreHeaders(token ?? undefined)
  const base = getBackendUrl()

  const [ordersRes, commissionsRes] = await Promise.all([
    fetch(`${base}/store/sellers/me/orders`, { headers, cache: 'no-store' }),
    fetch(`${base}/store/commissions?limit=100`, { headers, cache: 'no-store' }),
  ])

  const orders: SellerOrder[] = ordersRes.ok
    ? ((await ordersRes.json()) as { orders: SellerOrder[] }).orders ?? []
    : []

  const commissionData: CommissionResponse = commissionsRes.ok
    ? ((await commissionsRes.json()) as CommissionResponse)
    : { stats: { totalEarnings: 0, approvedAmount: 0, totalCount: 0 } }

  const stats = commissionData.stats ?? { totalEarnings: 0, approvedAmount: 0, totalCount: 0 }

  const activeOrderCount = orders.filter(
    (o) => o.fulfillment_status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'completed'
  ).length

  const currencyCode = orders[0]?.currency_code ?? 'usd'

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return {
    totalRevenue: stats.totalEarnings,
    approvedEarnings: stats.approvedAmount,
    activeOrderCount,
    totalCommissions: stats.totalCount,
    currencyCode,
    recentOrders,
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDashboardStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardData,
    staleTime: 60_000,
  })

  return { stats: data ?? null, isLoading, error, refetch }
}
