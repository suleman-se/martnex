'use client'

import { ShoppingBag, Search, Filter, ChevronRight, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMounted } from '@/hooks/use-mounted'
import {
  useSellerOrders,
  formatOrderStatus,
  formatCustomerName,
  formatCurrency,
} from '@/hooks/use-seller-orders'
import type { SellerOrder } from '@/hooks/use-seller-orders'

function StatusBadge({ status, fulfillmentStatus }: { status: string; fulfillmentStatus?: string }) {
  const label = formatOrderStatus(status, fulfillmentStatus)
  const colorMap: Record<string, string> = {
    Processing: 'bg-amber-50 text-amber-600',
    Fulfilling: 'bg-purple-50 text-purple-600',
    Shipped: 'bg-blue-50 text-primary',
    Delivered: 'bg-emerald-50 text-emerald-600',
    Cancelled: 'bg-rose-50 text-rose-600',
  }
  const colors = colorMap[label] ?? 'bg-slate-50 text-slate-500'
  return (
    <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colors}`}>
      {label}
    </span>
  )
}

function OrdersTableSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-slate-50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-8 py-6 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-4 bg-slate-100 rounded w-20" />
          <div className="h-4 bg-slate-100 rounded w-32" />
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-6 bg-slate-100 rounded-full w-20" />
        </div>
      ))}
    </div>
  )
}

export default function SellerOrdersPage() {
  const mounted = useMounted()
  const router = useRouter()
  const { orders, isLoading, refetch } = useSellerOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredOrders = orders.filter((order: SellerOrder) => {
    const displayLabel = formatOrderStatus(order.status, order.fulfillment_status)
    const customerName = formatCustomerName(order.customer).toLowerCase()
    const orderId = `#${order.display_id}`

    const matchesSearch =
      search === '' ||
      customerName.includes(search.toLowerCase()) ||
      orderId.includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || displayLabel.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Stats derived from live data
  const pending = orders.filter(
    (o: SellerOrder) => o.fulfillment_status === 'not_fulfilled' || !o.fulfillment_status
  ).length
  const inTransit = orders.filter((o: SellerOrder) => o.fulfillment_status === 'shipped').length
  const completed = orders.filter(
    (o: SellerOrder) => o.fulfillment_status === 'delivered' || o.status === 'completed'
  ).length

  if (!mounted) return null

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
            Customer Orders
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Track and manage your sales and fulfillments with precision.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-3 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">
            {isLoading ? <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" /> : pending}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">In Transit</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">
            {isLoading ? <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" /> : inTransit}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">
            {isLoading ? <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" /> : completed}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="w-full bg-slate-100/50 border-none rounded-[1.25rem] pl-14 pr-6 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-8 py-4 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="all">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="fulfilling">Fulfilling</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Order</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Subtotal</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                  <Filter className="w-4 h-4 inline-block" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <OrdersTableSkeleton />
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: SellerOrder) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/seller/orders/${order.id}`)}
                    className="hover:bg-slate-50/30 transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <span className="font-heading font-black text-slate-900 tracking-tight">
                        #{order.display_id}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-900 font-bold">
                      {formatCustomerName(order.customer)}
                    </td>
                    <td className="px-8 py-6 text-base font-black text-slate-900 tracking-tight font-heading">
                      {formatCurrency(order.seller_subtotal, order.currency_code)}
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge
                        status={order.status}
                        fulfillmentStatus={order.fulfillment_status}
                      />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); router.push(`/seller/orders/${order.id}`) }}
                        className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-primary transition-all active:scale-90 group-hover:translate-x-1"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredOrders.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-heading font-black text-slate-900">No orders found</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
              {search || statusFilter !== 'all'
                ? 'No orders match your current filters.'
                : 'Your orders will show up here once customers start purchasing your products.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
