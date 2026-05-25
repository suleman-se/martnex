'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Package, ShoppingBag, MapPin, ClipboardList } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useMounted } from '@/hooks/use-mounted'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/shared/typography/eyebrow'

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
  const [confetti, setConfetti] = useState<{ id: number; left: number; delay: number; color: string; scale: number }[]>([])

  useEffect(() => {
    if (mounted) {
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
      const items = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: Math.random() * 0.7 + 0.4,
      }))
      setConfetti(items)
    }
  }, [mounted])

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
      <EmptyState
        icon={ShoppingBag}
        title="Order Not Found"
        description="We couldn't find this order."
        className="max-w-2xl mx-auto py-24 opacity-100"
        action={
          <Button asChild variant="link" className="text-sm font-bold text-slate-900">
            <Link href="/store">Return to Shop</Link>
          </Button>
        }
      />
    )
  }

  const fmt = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: order.currency_code.toUpperCase(),
    }).format(amount)

  function getFulfillmentStep(statusText: string): number {
    const s = statusText.toLowerCase()
    if (s === 'completed' || s === 'delivered') return 4
    if (s === 'shipped') return 3
    if (s === 'processing' || s === 'requires_action') return 2
    return 1 // Placed
  }

  const currentStep = getFulfillmentStep(order.status)
  const steps = [
    { label: 'Placed', desc: 'Order received' },
    { label: 'Processing', desc: 'Preparing package' },
    { label: 'Shipped', desc: 'In transit' },
    { label: 'Delivered', desc: 'Arrived' },
  ]

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-700 space-y-6 relative">
      {/* CSS Confetti keyframes styling */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall 4.5s linear forwards;
        }
      ` }} />

      {/* Rain falling particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 h-[100vh]">
        {confetti.map((c) => (
          <div
            key={c.id}
            className="absolute top-0 animate-fall w-2.5 h-2.5 rounded-sm"
            style={{
              left: `${c.left}%`,
              animationDelay: `${c.delay}s`,
              backgroundColor: c.color,
              transform: `scale(${c.scale})`,
            }}
          />
        ))}
      </div>

      {/* Success hero */}
      <Card className="rounded-3xl border-none bg-white p-10 text-center shadow-sm relative overflow-hidden">
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
            A confirmation has been sent to{' '}
            <span className="font-bold text-slate-600">{order.email}</span>
          </p>
        )}
      </Card>

      {/* Delivery Lifecycle Tracker */}
      <Card className="rounded-3xl border-none bg-white p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="h-4 w-4 text-slate-400" />
          <Eyebrow className="text-[11px] tracking-[0.2em] pt-0.5">
            Fulfillment Progress
          </Eyebrow>
        </div>

        <div className="relative flex items-center justify-between px-2 pt-2">
          {/* Progress bar background line */}
          <div className="absolute left-6 right-6 top-[18px] -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0" />
          {/* Progress bar active line */}
          <div
            className="absolute left-6 top-[18px] -translate-y-1/2 h-1 bg-slate-900 rounded-full transition-all duration-1000 z-0"
            style={{ width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 12px)` }}
          />

          {steps.map((step, idx) => {
            const isCompleted = idx < currentStep
            const isActive = idx === currentStep - 1

            return (
              <div key={step.label} className="relative z-10 flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 font-bold text-xs ${
                    isCompleted
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : isActive
                      ? 'bg-white border-slate-900 text-slate-900 ring-4 ring-slate-900/5 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div className="text-center mt-3">
                  <p
                    className={`text-xs font-bold transition-colors ${
                      isActive ? 'text-slate-900' : isCompleted ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5 max-w-[90px] mx-auto">
                    {step.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Items */}
      <Card className="rounded-3xl border-none bg-white p-6 shadow-sm space-y-4">
        <Eyebrow className="text-[11px] tracking-[0.2em]">
          Items Ordered
        </Eyebrow>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-14 w-14 rounded-2xl object-cover bg-slate-50 shrink-0 border border-slate-100/50"
              />
            ) : (
              <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-slate-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
              <p className="text-xs text-slate-400 font-semibold">Qty {item.quantity}</p>
            </div>
            <p className="text-sm font-black text-slate-900 shrink-0">{fmt(item.total)}</p>
          </div>
        ))}

        <div className="pt-4 border-t border-slate-100 space-y-1.5 text-sm">
          {order.shipping_total > 0 && (
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Shipping</span>
              <span>{fmt(order.shipping_total)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-slate-900 pt-1">
            <span>Total Paid</span>
            <span>{fmt(order.total)}</span>
          </div>
        </div>
      </Card>

      {/* Shipping address */}
      {order.shipping_address?.address_1 && (
        <Card className="rounded-3xl border-none bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-slate-400" />
            <Eyebrow className="text-[11px] tracking-[0.2em] pt-0.5">
              Shipping Destination
            </Eyebrow>
          </div>
          <p className="text-sm font-bold text-slate-800">
            {[order.shipping_address.first_name, order.shipping_address.last_name]
              .filter(Boolean)
              .join(' ')}
          </p>
          <p className="text-sm text-slate-500 mt-1 font-semibold">{order.shipping_address.address_1}</p>
          <p className="text-sm text-slate-500 font-semibold">
            {[
              order.shipping_address.city,
              order.shipping_address.postal_code,
              order.shipping_address.country_code?.toUpperCase(),
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </Card>
      )}

      {/* CTA */}
      <Button
        asChild
        className="w-full h-14 rounded-2xl bg-slate-900 py-4 text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-sm cursor-pointer"
      >
        <Link href="/store" className="flex items-center justify-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Continue Shopping
        </Link>
      </Button>
    </div>
  )
}
