import Link from 'next/link'
import type { SellerOrder } from '@/hooks/use-seller-orders'
import { formatCurrency } from '@/hooks/use-seller-orders'

interface ActivityFeedProps {
  orders?: SellerOrder[]
  isLoading?: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function ActivityFeed({ orders = [], isLoading = false }: ActivityFeedProps) {
  return (
    <div className="bg-white rounded-[2rem] p-10 shadow-sm flex flex-col h-full hover:shadow-premium transition-all duration-500">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-heading font-black text-slate-900">Recent Activity</h3>
        <span className="text-[10px] font-black text-primary bg-blue-50 px-3 py-1.5 rounded-full tracking-widest uppercase">Live Pulse</span>
      </div>

      <div className="space-y-10 flex-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-5 animate-pulse">
              <div className="w-3 h-3 rounded-full bg-slate-100 mt-1 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-2.5 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : orders.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium text-center py-8">
            No recent orders yet.
          </p>
        ) : (
          orders.map((order, i) => (
            <Link
              key={order.id}
              href={`/seller/orders/${order.id}`}
              className="flex gap-5 group cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/30 z-10 relative mt-1" />
                {i < orders.length - 1 && (
                  <div className="absolute top-4 left-1.5 w-[2px] h-12 bg-slate-100" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-800 font-bold group-hover:text-primary transition-colors leading-snug">
                  New order #{order.display_id}
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-wide">
                  {timeAgo(order.created_at)} • {formatCurrency(order.seller_subtotal, order.currency_code)}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link
        href="/seller/orders"
        className="mt-10 block w-full py-4 rounded-2xl bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-primary hover:text-white transition-all duration-300 text-center"
      >
        View All Orders
      </Link>
    </div>
  )
}
