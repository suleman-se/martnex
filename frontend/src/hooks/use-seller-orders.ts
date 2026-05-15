'use client'

import { useQuery } from '@tanstack/react-query'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SellerOrderItem {
  id: string
  title: string
  product_id: string
  variant_id?: string
  quantity: number
  unit_price: number
  total: number
  thumbnail?: string
}

export interface SellerOrder {
  id: string
  display_id: number
  status: string
  fulfillment_status?: string
  payment_status?: string
  currency_code: string
  created_at: string
  customer?: {
    id: string
    first_name?: string
    last_name?: string
    email: string
  }
  items: SellerOrderItem[]
  seller_subtotal: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps Medusa order status + fulfillment status to a human-readable display label.
 */
export function formatOrderStatus(
  status: string,
  fulfillmentStatus?: string
): string {
  if (status === 'cancelled') return 'Cancelled'
  switch (fulfillmentStatus) {
    case 'delivered':
      return 'Delivered'
    case 'shipped':
      return 'Shipped'
    case 'fulfilled':
    case 'partially_fulfilled':
      return 'Fulfilling'
    default:
      return 'Processing'
  }
}

export function formatCustomerName(customer?: SellerOrder['customer']): string {
  if (!customer) return 'Guest'
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ')
  return name || customer.email
}

export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchSellerOrders(): Promise<SellerOrder[]> {
  const token = localStorage.getItem('access_token')
  const headers = await buildStoreHeaders(token ?? undefined)
  const response = await fetch(`${getBackendUrl()}/store/sellers/me/orders`, {
    headers,
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Failed to fetch orders')
  const data = (await response.json()) as { orders: SellerOrder[] }
  return data.orders ?? []
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSellerOrders() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: fetchSellerOrders,
    staleTime: 30_000,
  })

  return {
    orders: data ?? [],
    isLoading,
    error,
    refetch,
  }
}
