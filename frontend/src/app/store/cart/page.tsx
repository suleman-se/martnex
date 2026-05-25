'use client'

import { useOptimistic, useTransition, useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import { useCart, type Cart } from '@/hooks/use-cart'
import { useProducts } from '@/hooks/use-products'
import { CartItemRow } from '@/components/store/cart/cart-item'
import { CartSummary } from '@/components/store/cart/cart-summary'
import { ProductCard } from '@/components/store/products/product-card'
import { formatPrice } from '@/lib/api'
import { toast } from 'sonner'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Button } from '@/components/ui/button'

const FREE_SHIPPING_THRESHOLD = 150

export default function CartPage() {
  const mounted = useMounted()
  const [isPending, startTransition] = useTransition()
  const { cart, isLoading, removeItem, updateQuantity } = useCart()

  // Fetch popular products for the inspirational empty state
  const { data: popularData, isLoading: isLoadingPopular } = useProducts({ limit: 4 })
  const popularProducts = popularData?.products || []

  // Optimistic reducer for cart items and totals
  const [optimisticCart, setOptimisticCart] = useOptimistic<Cart | null, { type: 'update' | 'remove'; payload: any }>(
    cart || null,
    (state, action) => {
      if (!state) return null

      if (action.type === 'remove') {
        const lineItemId = action.payload
        const newItems = state.items.filter((item) => item.id !== lineItemId)
        const newSubtotal = newItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
        const newTotal = newSubtotal + state.shipping_total + state.tax_total - state.discount_total

        return {
          ...state,
          items: newItems,
          subtotal: newSubtotal,
          total: Math.max(0, newTotal),
        }
      }

      if (action.type === 'update') {
        const { lineItemId, quantity } = action.payload
        const newItems = state.items.map((item) => {
          if (item.id === lineItemId) {
            const total = item.unit_price * quantity
            return { ...item, quantity, total }
          }
          return item
        })
        const newSubtotal = newItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
        const newTotal = newSubtotal + state.shipping_total + state.tax_total - state.discount_total

        return {
          ...state,
          items: newItems,
          subtotal: newSubtotal,
          total: Math.max(0, newTotal),
        }
      }

      return state
    }
  )

  async function handleRemove(lineItemId: string) {
    startTransition(async () => {
      setOptimisticCart({ type: 'remove', payload: lineItemId })
      try {
        await removeItem.mutateAsync(lineItemId)
        toast.success('Item removed from cart')
      } catch {
        toast.error('Failed to remove item')
      }
    })
  }

  async function handleUpdateQuantity(lineItemId: string, quantity: number) {
    if (quantity < 1) {
      await handleRemove(lineItemId)
      return
    }
    startTransition(async () => {
      setOptimisticCart({ type: 'update', payload: { lineItemId, quantity } })
      try {
        await updateQuantity.mutateAsync({ lineItemId, quantity })
      } catch {
        toast.error('Failed to update quantity')
      }
    })
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-100 rounded w-1/4 mb-10" />
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

  const items = optimisticCart?.items ?? []
  const isEmpty = items.length === 0
  const subtotal = optimisticCart?.subtotal ?? 0
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal
  const isFreeShipping = remaining <= 0
  const progressPercentage = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
          Shopping Cart
          {!isEmpty && (
            <span className="ml-3 text-2xl text-slate-400 font-bold">
              ({items.reduce((s, i) => s + i.quantity, 0)})
            </span>
          )}
        </h1>
        <Link
          href="/store"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>
      </div>

      {isEmpty ? (
        <div className="space-y-16">
          <EmptyState
            icon={ShoppingBag}
            title="Your Cart Is Empty"
            description="Explore our collections and discover unique handcrafted products."
            className="py-16 bg-white border border-slate-100 rounded-3xl shadow-sm"
            action={
              <Button
                asChild
                className="rounded-2xl bg-slate-900 px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-800 shadow-sm cursor-pointer"
              >
                <Link href="/store">Browse Products</Link>
              </Button>
            }
          />

          {popularProducts.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-lg font-heading font-black text-slate-900 mb-6 uppercase tracking-wider text-center sm:text-left">
                Recommended For You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {popularProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    currencyCode={cart?.currency_code || 'usd'}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Free Shipping Meter */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  {isFreeShipping ? (
                    <span className="text-emerald-600 font-bold">
                      🎉 Congratulations! You qualify for Free Shipping!
                    </span>
                  ) : (
                    <span>
                      You are only{' '}
                      <strong className="text-slate-900 font-extrabold">
                        {formatPrice(remaining, optimisticCart?.currency_code || 'usd')}
                      </strong>{' '}
                      away from Free Shipping!
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeShipping ? 'bg-emerald-500' : 'bg-slate-900'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Line items list */}
            <div className="bg-white rounded-3xl shadow-sm px-8 divide-y divide-slate-100 border border-slate-100/50">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  currencyCode={optimisticCart!.currency_code}
                  onRemove={handleRemove}
                  onUpdateQuantity={handleUpdateQuantity}
                  isPending={removeItem.isPending || updateQuantity.isPending || isPending}
                />
              ))}
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-1">
            <CartSummary cart={optimisticCart!} />
          </div>
        </div>
      )}
    </div>
  )
}
