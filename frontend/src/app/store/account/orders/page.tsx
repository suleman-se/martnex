'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCustomerOrders, formatPrice } from '@/lib/api'
import { useMounted } from '@/hooks/use-mounted'
import { ShoppingBag, ArrowRight, Package, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ITEMS_PER_PAGE = 8

export default function OrderHistoryPage() {
  const mounted = useMounted()
  const [currentPage, setCurrentPage] = useState(1)

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['customer-orders-list', currentPage],
    queryFn: () => fetchCustomerOrders(ITEMS_PER_PAGE, offset, token ?? undefined),
    enabled: mounted && !!token,
  })

  if (!mounted) return null

  const orders = data?.orders || []
  const count = data?.count || 0
  const totalPages = Math.max(1, Math.ceil(count / ITEMS_PER_PAGE))

  function getStatusStyle(statusText: string) {
    const s = (statusText || '').toLowerCase()
    if (s === 'completed' || s === 'delivered') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
    }
    if (s === 'shipped') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
    }
    if (s === 'processing' || s === 'requires_action') {
      return 'bg-amber-50 text-amber-750 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
    }
    return 'bg-slate-55/70 text-slate-700 dark:bg-slate-900/40 dark:text-slate-400 border border-slate-100 dark:border-slate-800'
  }

  function getStatusLabel(statusText: string): string {
    const s = (statusText || '').toLowerCase()
    if (s === 'completed' || s === 'delivered') return 'Delivered'
    if (s === 'shipped') return 'Shipped'
    if (s === 'processing' || s === 'requires_action') return 'Processing'
    return 'Placed'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-900">
          Order History
        </h1>
        <p className="text-sm text-slate-400 mt-1 font-medium">
          View your past purchases, download invoices, and track live deliveries.
        </p>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-32 w-full bg-slate-50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-slate-400 font-medium">
          <ShoppingBag className="h-12 w-12 text-slate-350 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-700">No Orders Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            You haven't bought anything on Martnex yet. Explore our creative merchant collections to get started!
          </p>
          <Button asChild className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-10 px-5 font-bold text-xs mt-6 cursor-pointer">
            <Link href="/store">Browse Store</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => {
            const itemsCount = (order.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0)
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })

            return (
              <Card
                key={order.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 md:p-6 shadow-sm hover:border-slate-205 transition-all flex flex-col gap-5"
              >
                {/* Order Top Bar: Date, ID, Status, Total */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-black text-slate-800 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl shadow-xs">
                      #{order.display_id}
                    </span>
                    <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {formatPrice(order.total || 0, order.currency_code || 'usd')}
                    </span>
                  </div>
                </div>

                {/* Order Items Horizontal Timeline Preview */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-3">
                      {(order.items || []).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl p-2 max-w-[200px] shrink-0">
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="h-10 w-10 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                              <Package className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                          <div className="min-w-0 text-left">
                            <p className="text-[11px] font-bold text-slate-800 truncate pr-1">
                              {item.title}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                              Qty {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions: Track Order */}
                  <Button
                    asChild
                    variant="ghost"
                    className="h-11 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-900 hover:text-white px-4 text-xs font-bold shrink-0 self-end md:self-center cursor-pointer flex items-center gap-1.5"
                  >
                    <Link href={`/store/orders/${order.id}`}>
                      Track Order
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2.5 pt-6">
          <Button
            size="icon"
            variant="outline"
            disabled={currentPage === 1 || isPlaceholderData}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="icon"
            variant="outline"
            disabled={currentPage === totalPages || isPlaceholderData}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-10 w-10 rounded-xl border-slate-200 hover:bg-slate-50 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
