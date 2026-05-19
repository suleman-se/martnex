'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag } from 'lucide-react'
import type { CartLineItem } from '@/hooks/use-cart'
import { formatPrice } from '@/hooks/use-products'

interface CartItemRowProps {
  item: CartLineItem
  currencyCode: string
  onRemove: (lineItemId: string) => void
  onUpdateQuantity: (lineItemId: string, quantity: number) => void
  isPending?: boolean
}

export function CartItemRow({
  item,
  currencyCode,
  onRemove,
  onUpdateQuantity,
  isPending = false,
}: CartItemRowProps) {
  const productHandle = item.product?.handle

  return (
    <div className={`flex items-start gap-5 py-5 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      {/* Thumbnail */}
      <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-slate-200" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {productHandle ? (
          <Link
            href={`/store/products/${productHandle}`}
            className="font-bold text-slate-900 text-sm leading-snug hover:text-slate-600 line-clamp-2 transition-colors"
          >
            {item.title}
          </Link>
        ) : (
          <p className="font-bold text-slate-900 text-sm leading-snug">{item.title}</p>
        )}
        {item.variant?.title && item.variant.title !== 'Default Variant' && (
          <p className="text-xs text-slate-400 font-medium mt-0.5">{item.variant.title}</p>
        )}
        <p className="text-xs font-medium text-slate-400 mt-1">
          {formatPrice(item.unit_price, currencyCode)} each
        </p>

        {/* Quantity stepper */}
        <div className="flex items-center gap-2 mt-3">
          <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1 || isPending}
              className="h-5 w-5 flex items-center justify-center text-slate-500 hover:text-slate-900 font-black text-base disabled:opacity-30"
            >
              −
            </button>
            <span className="w-5 text-center text-xs font-black text-slate-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isPending}
              className="h-5 w-5 flex items-center justify-center text-slate-500 hover:text-slate-900 font-black text-base disabled:opacity-30"
            >
              +
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            disabled={isPending}
            className="h-7 w-7 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-30"
            aria-label="Remove item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Line total */}
      <div className="text-right shrink-0">
        <p className="font-black text-slate-900 text-sm">
          {formatPrice(item.total, currencyCode)}
        </p>
      </div>
    </div>
  )
}
