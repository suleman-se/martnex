'use client'

import { useCart } from '@/hooks/use-cart'
import { useUIStore } from '@/hooks/use-ui-store'
import { useRegions } from '@/hooks/use-regions'
import { getDisplayPrice, formatPrice } from '@/lib/api'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Drawer } from '@/components/shared/drawer'

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore()
  const { cart, isLoading, updateQuantity, removeItem } = useCart()
  const { defaultRegion } = useRegions()
  const currencyCode = defaultRegion?.currency_code || 'usd'

  const items = cart?.items || []
  const subtotal = cart?.subtotal || 0

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={closeCart}
      position="right"
      showCloseButton={false}
    >
      <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-slate-800" />
            <h2 className="font-heading font-black text-slate-900 text-base uppercase tracking-wider">
              Shopping Cart
            </h2>
            {items.length > 0 && (
              <span className="h-5 min-w-[20px] px-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center animate-in zoom-in duration-300">
                {items.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="h-9 w-9 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 py-20 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
              <p className="text-xs font-semibold">Updating cart...</p>
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0 group/item"
              >
                {/* Thumbnail */}
                <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100/50">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="80px"
                      className="object-cover group-hover/item:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-slate-200 absolute inset-0 m-auto" />
                  )}
                </div>

                {/* Info & controls */}
                <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 truncate leading-tight">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      {item.variant?.title || 'Default Variant'}
                    </p>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center mt-auto">
                    <div className="flex items-center border border-slate-100 rounded-xl bg-slate-50/50 p-0.5 shrink-0">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity.mutate({ lineItemId: item.id, quantity: item.quantity - 1 })
                          } else {
                            removeItem.mutate(item.id)
                          }
                        }}
                        disabled={updateQuantity.isPending || removeItem.isPending}
                        className="h-6 w-6 rounded-lg hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer animate-press"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          updateQuantity.mutate({ lineItemId: item.id, quantity: item.quantity + 1 })
                        }}
                        disabled={updateQuantity.isPending}
                        className="h-6 w-6 rounded-lg hover:bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer animate-press"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price & Trash */}
                <div className="flex flex-col items-end justify-between h-20 text-right shrink-0 pl-2">
                  <span className="text-xs font-black text-slate-900">
                    {formatPrice(item.unit_price * item.quantity, currencyCode)}
                  </span>
                  
                  <button
                    onClick={() => removeItem.mutate(item.id)}
                    disabled={removeItem.isPending}
                    className="h-7 w-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer mt-auto"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Your cart is empty</h3>
                <p className="text-xs text-slate-400 font-medium max-w-xs mt-1 px-4 leading-relaxed">
                  Looks like you haven&apos;t added anything to your cart yet. Discover our premium collections.
                </p>
              </div>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-100 space-y-4 shrink-0 bg-slate-50/50">
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Taxes</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="h-px bg-slate-200/50 my-1" />
              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span>Subtotal</span>
                <span className="text-base">{formatPrice(subtotal, currencyCode)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 gap-2 pt-2">
              <Link
                href="/store/checkout"
                onClick={closeCart}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-premium group/btn"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Link>
              <Link
                href="/store/cart"
                onClick={closeCart}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center transition-colors"
              >
                View Shopping Bag
              </Link>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
