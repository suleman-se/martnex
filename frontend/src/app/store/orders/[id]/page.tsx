'use client'

import { use } from 'react'
import Link from 'next/link'
import { CheckCircle, Package, ShoppingBag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMounted } from '@/hooks/use-mounted'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmationOrderItem {
  id: string
  title: string
  quantity: number
  unit_price: number
  total: number
  thumbnail?: string
}

interface ConfirmationOrder {
  id: string
  display_id: number
  status: string
  currency_code: string
  total: number
  subtotal: number
  shipping_total: number
  email?: string
  items: ConfirmationOrderItem[]
  shipping_address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    city?: string
    country_code?: string
    postal_code?: string
  }
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchOrder(id: string): Promise<ConfirmationOrder> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const headers = await buildStoreHeaders(token ?? undefined)
  const res = await fetch(`${getBackendUrl()}/store/orders/${id}`, { headers })
  if (!res.ok) throw new Error('Order not found')
  const data = (await res.json()) as { order: ConfirmationOrder }
  return data.order
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const mounted = useMounted()

  const { data: order, isLoading } = useQuery({
    queryKey: ['store-order-confirmation', id],
    queryFn: () => fetchOrder(id),
    staleTime: Infinity,
    enabled: Boolean(id),
  })

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4 py-12">
        <div className="h-20 w-20 bg-slate-100 rounded-full mx-auto" />
        <div className="h-8 bg-slate-100 rounded w-64 mx-auto" />
        <div className="h-4 bg-slate-100 rounded w-48 mx-auto" />
        <div className="bg-white rounded-3xl shadow-sm p-6 mt-8 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-14 w-14 bg-slate-100 rounded-2xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-24">
        <p className="text-slate-500 font-medium mb-4">Order not found.</p>
        <Link
          href="/store"
          className="text-sm font-bold text-slate-900 underline underline-offset-4"
        >
          Return to Shop
        </Link>
      </div>
    )
  }

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency_code.toUpperCase(),
    }).format(amount)

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-700 space-y-6">
      {/* Success hero */}
      <div className="bg-white rounded-3xl shadow-sm p-10 text-center">
        <div className="flex items-center justify-center h-20 w-20 bg-emerald-50 rounded-full mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-heading font-black text-slate-900">Order Confirmed!</h1>
        <p className="text-slate-500 font-medium mt-2">
          Order <span className="font-black text-slate-700">#{order.display_id}</span> has been
          placed successfully.
        </p>
        {order.email && (
          <p className="text-sm text-slate-400 mt-1">
            A confirmation will be sent to{' '}
            <span className="font-bold text-slate-600">{order.email}</span>
          </p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
          Items Ordered
        </h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-14 w-14 rounded-2xl object-cover bg-slate-50 shrink-0"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-slate-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
              <p className="text-xs text-slate-400">Qty {item.quantity}</p>
            </div>
            <p className="text-sm font-black text-slate-900 shrink-0">{fmt(item.total)}</p>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-100 space-y-1.5 text-sm">
          {order.shipping_total > 0 && (
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Shipping</span>
              <span>{fmt(order.shipping_total)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-slate-900 pt-1">
            <span>Total</span>
            <span>{fmt(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      {order.shipping_address?.address_1 && (
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">
            Shipping To
          </h2>
          <p className="text-sm font-bold text-slate-800">
            {[order.shipping_address.first_name, order.shipping_address.last_name]
              .filter(Boolean)
              .join(' ')}
          </p>
          <p className="text-sm text-slate-500">{order.shipping_address.address_1}</p>
          <p className="text-sm text-slate-500">
            {[
              order.shipping_address.city,
              order.shipping_address.postal_code,
              order.shipping_address.country_code?.toUpperCase(),
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}

      {/* CTA */}
      <Link
        href="/store"
        className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-premium hover:-translate-y-0.5 duration-300 w-full"
      >
        <ShoppingBag className="h-4 w-4" />
        Continue Shopping
      </Link>
    </div>
  )
}
