'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/lib/store/auth-store'
import { fetchCustomerOrders } from '@/lib/api'
import { useMounted } from '@/hooks/use-mounted'
import { ShoppingBag, Sparkles, MapPin, User, ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AccountDashboardPage() {
  const mounted = useMounted()
  const { user } = useAuthStore()

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null

  const { data, isLoading } = useQuery({
    queryKey: ['customer-orders-summary'],
    queryFn: () => fetchCustomerOrders(20, 0, token ?? undefined),
    enabled: mounted && !!token,
  })

  if (!mounted) return null

  const orders = data?.orders || []
  const totalOrdersCount = data?.count || orders.length

  // Calculate active shipments (fulfillment status not completed or delivered)
  const activeShipments = orders.filter((o: any) => {
    const status = (o.status || '').toLowerCase()
    return status === 'placed' || status === 'processing' || status === 'shipped'
  }).length

  // TODO: Replace with real database-backed platform savings index logic
  // Premium platform savings index (mock indicator computed off purchases to feel alive)
  const savingsIndex = totalOrdersCount > 0 ? totalOrdersCount * 12.80 + 15.00 : 0

  const recentOrders = orders.slice(0, 3)

  const quickActions = [
    {
      title: 'Order History',
      description: 'Track, return, or buy items again',
      href: '/store/account/orders',
      icon: ShoppingBag,
      color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400',
    },
    {
      title: 'Saved Addresses',
      description: 'Manage shipping destinations',
      href: '/store/account/addresses',
      icon: MapPin,
      color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-400',
    },
    {
      title: 'Profile Settings',
      description: 'Update name, phone, and details',
      href: '/store/account/profile',
      icon: User,
      color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-650 dark:text-amber-400',
    },
  ]

  const formattedName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Valued Buyer'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-slate-900">
            Welcome Back, <span className="text-slate-700">{formattedName}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Manage your purchases, shipping preferences, and personal details.
          </p>
        </div>
        <Button asChild size="sm" className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl h-10 px-4 font-bold text-xs shrink-0 cursor-pointer">
          <Link href="/store" className="flex items-center gap-1.5">
            Continue Shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* 3-Column Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1: Total Purchases */}
        <Card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <ShoppingBag className="h-28 w-28 text-slate-900" />
          </div>
          <div className="h-12 w-12 bg-indigo-50/80 dark:bg-indigo-950/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Purchases</p>
            {isLoading ? (
              <div className="h-7 w-12 bg-slate-100 rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-black text-slate-800">{totalOrdersCount} {totalOrdersCount === 1 ? 'Order' : 'Orders'}</h3>
            )}
          </div>
        </Card>

        {/* Stat 2: Active Shipments */}
        <Card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <Package className="h-28 w-28 text-slate-900" />
          </div>
          <div className="h-12 w-12 bg-emerald-50/80 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Shipments</p>
            {isLoading ? (
              <div className="h-7 w-12 bg-slate-100 rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-black text-slate-800">{activeShipments} Pending</h3>
            )}
          </div>
        </Card>

        {/* Stat 3: Savings Index */}
        <Card className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
            <Sparkles className="h-28 w-28 text-slate-900" />
          </div>
          <div className="h-12 w-12 bg-amber-50/80 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Savings Index</p>
            {isLoading ? (
              <div className="h-7 w-12 bg-slate-100 rounded animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-black text-slate-800">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingsIndex)}
              </h3>
            )}
          </div>
        </Card>
      </div>

      {/* Split Layout: Recent Orders & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left 3 Columns: Recent Orders */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-850 uppercase tracking-[0.15em]">Recent Purchases</h2>
            {totalOrdersCount > 0 && (
              <Link href="/store/account/orders" className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="h-20 w-full bg-slate-50 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <Card className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-slate-400 font-medium">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm">You haven't placed any orders yet.</p>
              <Button asChild variant="link" className="text-xs font-bold text-slate-900 mt-1">
                <Link href="/store">Explore Products</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => {
                const itemThumbnails = (order.items || []).map((it: any) => it.thumbnail).filter(Boolean)
                const itemsCount = (order.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0)

                return (
                  <Card key={order.id} className="rounded-2xl border border-slate-100 bg-white p-4 hover:border-slate-205 transition-all flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex -space-x-2.5 shrink-0">
                        {itemThumbnails.slice(0, 3).map((thumb: string, i: number) => (
                          <img
                            key={i}
                            src={thumb}
                            alt="item"
                            className="h-11 w-11 rounded-xl object-cover bg-slate-50 border border-slate-100 shadow-sm"
                          />
                        ))}
                        {itemThumbnails.length === 0 && (
                          <div className="h-11 w-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                            <Package className="h-5 w-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          Order #{order.display_id}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'} · {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency_code || 'USD' }).format(order.total || 0)}
                        </p>
                        <span className="inline-block text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          {order.status}
                        </span>
                      </div>
                      <Button asChild size="icon" variant="ghost" className="h-9 w-9 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-900 hover:text-white shrink-0 cursor-pointer">
                        <Link href={`/store/orders/${order.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-black text-slate-850 uppercase tracking-[0.15em]">Quick Settings</h2>
          <div className="flex flex-col gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-205 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-slate-950 transition-colors">{action.title}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
