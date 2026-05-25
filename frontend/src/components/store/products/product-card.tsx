'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Plus, Loader2, Check } from 'lucide-react'
import type { StoreProduct } from '@/lib/api'
import { getDisplayPrice, formatPrice } from '@/lib/api'
import { useCart } from '@/hooks/use-cart'
import { useRegions } from '@/hooks/use-regions'
import { toast } from 'sonner'

interface ProductCardProps {
  product: StoreProduct
  currencyCode?: string
}

export function ProductCard({ product, currencyCode = 'usd' }: ProductCardProps) {
  const price = getDisplayPrice(product, currencyCode)
  const { defaultRegion } = useRegions()
  const { addItem } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const hasMultipleVariants = product.variants.length > 1
  const secondaryImage = product.images?.[1]?.url

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (hasMultipleVariants) {
      // Redirect to detail page if there are options to choose
      window.location.href = `/store/products/${product.handle}`
      return
    }

    const firstVariant = product.variants[0]
    if (!firstVariant) return

    setIsAdding(true)
    try {
      await addItem.mutateAsync({
        variantId: firstVariant.id,
        quantity: 1,
        regionId: defaultRegion?.id,
      })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
    } catch {
      toast.error('Failed to add item to cart. Please try again.')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link
      href={`/store/products/${product.handle}`}
      className="group bg-white rounded-3xl shadow-sm hover:shadow-premium overflow-hidden transition-all duration-500 hover:-translate-y-1 flex flex-col relative"
    >
      {/* Image */}
      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {product.thumbnail ? (
          <>
            {/* Primary Image */}
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover transition-all duration-700 ${
                secondaryImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
              }`}
            />
            {/* Secondary Hover Image */}
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.title} Alternate`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 scale-100 group-hover:scale-105"
              />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-slate-200" />
          </div>
        )}
        {product.categories?.[0] && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm z-10">
            {product.categories[0].name}
          </span>
        )}

        {/* Hover Quick Add Action Button */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdding}
          className={`absolute bottom-3 right-3 h-10 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 translate-y-2 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-300 shadow-lg cursor-pointer z-10 text-[10px] font-black uppercase tracking-widest ${
            hasMultipleVariants ? 'px-4 gap-1.5' : 'w-10'
          }`}
          aria-label={hasMultipleVariants ? "Select Options" : "Quick Add to Cart"}
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : isSuccess ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : hasMultipleVariants ? (
            <>
              <span>Select Options</span>
              <Plus className="h-3 w-3" />
            </>
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-base font-black text-slate-900">
            {price != null ? formatPrice(price, currencyCode) : '—'}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
