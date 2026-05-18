'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, MapPin, User, CreditCard, RefreshCw } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import {
  useSellerOrder,
  formatOrderStatus,
  formatCustomerName,
  formatCurrency,
} from '@/hooks/use-seller-orders'
import type { SellerOrderItem } from '@/hooks/use-seller-orders'

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status, fulfillmentStatus }: { status: string; fulfillmentStatus?: string }) {
  const label = formatOrderStatus(status, fulfillmentStatus)
  const colorMap: Record<string, string> = {
    Processing: 'bg-amber-50 text-amber-600',
    Fulfilling: 'bg-purple-50 text-purple-600',
    Shipped:    'bg-blue-50 text-primary',
    Delivered:  'bg-emerald-50 text-emerald-600',
    Cancelled:  'bg-rose-50 text-rose-600',
  }
  const colors = colorMap[label] ?? 'bg-slate-50 text-slate-500'
  return (
    <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colors}`}>
      {label}
    </span>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 bg-slate-100 rounded-xl w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 bg-white rounded-2xl p-6">
              <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
              <div className="h-5 bg-slate-100 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-40 bg-slate-100 rounded-3xl" />
          <div className="h-40 bg-slate-100 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const mounted = useMounted()
  const { order, isLoading, error, refetch } = useSellerOrder(id)

  if (!mounted) return null

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/seller/orders"
            className="p-3 rounded-2xl bg-white shadow-sm text-slate-400 hover:text-primary hover:bg-blue-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
              {isLoading ? (
                <span className="inline-block w-36 h-9 bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                `Order #${order?.display_id ?? '—'}`
              )}
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">
              {order ? new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {order && (
            <StatusBadge status={order.status} fulfillmentStatus={order.fulfillment_status} />
          )}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-5 py-3 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-rose-50 text-rose-600 rounded-3xl px-8 py-6 font-bold">
          Could not load order. It may not exist or you may not have access.
        </div>
      )}

      {isLoading && <DetailSkeleton />}

      {order && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: line items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">
              Your Items ({order.items.length})
            </h2>
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-500">
              <ul className="divide-y divide-slate-50">
                {order.items.map((item: SellerOrderItem) => (
                  <li key={item.id} className="flex items-center gap-5 px-8 py-6">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 relative">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Qty {item.quantity} × {formatCurrency(item.unit_price, order.currency_code)}
                      </p>
                    </div>

                    {/* Line total */}
                    <p className="font-heading font-black text-slate-900 tracking-tight whitespace-nowrap">
                      {formatCurrency(
                        item.total ?? item.unit_price * item.quantity,
                        order.currency_code
                      )}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Subtotal footer */}
              <div className="border-t border-slate-50 px-8 py-6 flex justify-between items-center bg-slate-50/30">
                <span className="text-sm font-black text-slate-500 uppercase tracking-[0.15em]">
                  Your Subtotal
                </span>
                <span className="text-2xl font-heading font-black text-slate-900 tracking-tight">
                  {formatCurrency(order.seller_subtotal, order.currency_code)}
                </span>
              </div>
            </div>
          </div>

          {/* Right: meta cards */}
          <div className="space-y-6">
            {/* Customer */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <User className="w-4.5 h-4.5 text-primary" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">Customer</h3>
              </div>
              {order.customer ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{formatCustomerName(order.customer)}</p>
                  <p className="text-sm text-slate-500 font-medium">{order.customer.email}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium">Guest checkout</p>
              )}
            </div>

            {/* Shipping address */}
            {order.shipping_address && (
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <MapPin className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">Ship To</h3>
                </div>
                <address className="not-italic text-sm text-slate-700 font-medium space-y-0.5 leading-relaxed">
                  <p className="font-bold text-slate-900">
                    {[order.shipping_address.first_name, order.shipping_address.last_name]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                  {order.shipping_address.address_1 && <p>{order.shipping_address.address_1}</p>}
                  {order.shipping_address.address_2 && <p>{order.shipping_address.address_2}</p>}
                  {(order.shipping_address.city || order.shipping_address.postal_code) && (
                    <p>
                      {[order.shipping_address.city, order.shipping_address.postal_code]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {order.shipping_address.country_code && (
                    <p className="uppercase text-slate-400 text-xs tracking-widest font-black mt-1">
                      {order.shipping_address.country_code}
                    </p>
                  )}
                </address>
              </div>
            )}

            {/* Payment status */}
            <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <CreditCard className="w-4.5 h-4.5 text-amber-600" />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.15em]">Payment</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium capitalize">
                  {(order.payment_status ?? 'unknown').replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {order.currency_code.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
