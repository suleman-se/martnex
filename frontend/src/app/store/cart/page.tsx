'use client'

import Link from 'next/link'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import { useCart } from '@/hooks/use-cart'
import { CartItemRow } from '@/components/store/cart/cart-item'
import { CartSummary } from '@/components/store/cart/cart-summary'
import { toast } from 'sonner'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const mounted = useMounted()
  const { cart, isLoading, removeItem, updateQuantity } = useCart()

  async function handleRemove(lineItemId: string) {
    try {
      await removeItem.mutateAsync(lineItemId)
    } catch {
      toast.error('Failed to remove item')
    }
  }

  async function handleUpdateQuantity(lineItemId: string, quantity: number) {
    if (quantity < 1) {
      await handleRemove(lineItemId)
      return
    }
    try {
      await updateQuantity.mutateAsync({ lineItemId, quantity })
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-5 py-5 border-b border-slate-100">
            <div className="h-20 w-20 bg-slate-100 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const items = cart?.items ?? []
  const isEmpty = items.length === 0

  return (
    <div className="animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
          Your Cart
          {!isEmpty && (
            <span className="ml-3 text-2xl text-slate-400">
              ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
          )}
        </h1>
        <Link
          href="/store"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Shop more
        </Link>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart Is Empty"
          description="Looks like you haven't added any products yet."
          className="py-24 opacity-100"
          action={
            <Button asChild className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black uppercase tracking-widest hover:bg-slate-800">
              <Link href="/store">Browse Products</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Line items */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm px-8 divide-y divide-slate-50">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                currencyCode={cart!.currency_code}
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
                isPending={removeItem.isPending || updateQuantity.isPending}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary cart={cart!} />
          </div>
        </div>
      )}
    </div>
  )
}
