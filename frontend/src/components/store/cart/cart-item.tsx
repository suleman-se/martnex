'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag } from 'lucide-react'
import type { CartLineItem } from '@/hooks/use-cart'
import { formatPrice } from '@/hooks/use-products'
import { QuantityStepper } from '@/components/shared/controls/quantity-stepper'
import { Button } from '@/components/ui/button'

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
  const lineTotal = Number.isFinite(item.total)
    ? item.total
    : Number(item.unit_price) * Number(item.quantity)

  return (
    <div className={`flex items-start gap-5 py-5 transition-opacity ${isPending ? 'opacity-50' : ''}`}>
      {/* Thumbnail */}
      <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-slate-50">
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
          <QuantityStepper
            value={item.quantity}
            onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
            onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disableDecrease={item.quantity <= 1 || isPending}
            disableIncrease={isPending}
          />
          <Button
            onClick={() => onRemove(item.id)}
            disabled={isPending}
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-lg text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
            aria-label="Remove item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Line total */}
      <div className="text-right shrink-0">
        <p className="font-black text-slate-900 text-sm">
          {formatPrice(Number.isFinite(lineTotal) ? lineTotal : 0, currencyCode)}
        </p>
      </div>
    </div>
  )
}
