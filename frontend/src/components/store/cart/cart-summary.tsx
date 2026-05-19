'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Cart } from '@/hooks/use-cart'
import { formatPrice } from '@/hooks/use-products'

interface CartSummaryProps {
  cart: Cart
}

export function CartSummary({ cart }: CartSummaryProps) {
  const currency = cart.currency_code

  const rows = [
    { label: 'Subtotal', amount: cart.subtotal },
    ...(cart.discount_total > 0 ? [{ label: 'Discount', amount: -cart.discount_total }] : []),
    ...(cart.shipping_total > 0 ? [{ label: 'Shipping', amount: cart.shipping_total }] : []),
    ...(cart.tax_total > 0 ? [{ label: 'Tax', amount: cart.tax_total }] : []),
  ]

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm space-y-4 sticky top-24">
      <h2 className="text-lg font-black text-slate-900">Order Summary</h2>

      <div className="space-y-2 divide-y divide-slate-50">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-slate-500">{row.label}</span>
            <span
              className={`text-sm font-bold ${row.amount < 0 ? 'text-emerald-600' : 'text-slate-800'}`}
            >
              {row.amount < 0 ? '−' : ''}
              {formatPrice(Math.abs(row.amount), currency)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-base font-black text-slate-900">Total</span>
        <span className="text-xl font-black text-slate-900">
          {formatPrice(cart.total, currency)}
        </span>
      </div>

      <Link
        href="/store/checkout"
        className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-premium hover:shadow-2xl hover:-translate-y-0.5 duration-300"
      >
        Proceed to Checkout <ArrowRight className="h-4 w-4" />
      </Link>

      <Link
        href="/store"
        className="block text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-1"
      >
        Continue Shopping
      </Link>
    </div>
  )
}
