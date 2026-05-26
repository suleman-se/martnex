'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Plus, Loader2, Check, X } from 'lucide-react'
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
  const [showMobileSelector, setShowMobileSelector] = useState(false)
  const [isAddingVariantId, setIsAddingVariantId] = useState<string | null>(null)

  const hasMultipleVariants = product.variants.length > 1
  const secondaryImage = product.images?.[1]?.url

  const getVariantPrice = (variant: typeof product.variants[0]) => {
    const priceObj = variant.prices.find(
      (p) => p.currency_code.toLowerCase() === currencyCode.toLowerCase()
    )
    return priceObj ? priceObj.amount : (variant.prices[0]?.amount ?? null)
  }

  async function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (hasMultipleVariants) {
      // Toggle slide-up variant selector inside the card on mobile/click
      setShowMobileSelector((prev) => !prev)
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

  async function handleVariantAdd(e: React.MouseEvent, variantId: string) {
    e.preventDefault()
    e.stopPropagation()

    setIsAdding(true)
    setIsAddingVariantId(variantId)
    try {
      await addItem.mutateAsync({
        variantId,
        quantity: 1,
        regionId: defaultRegion?.id,
      })
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 2000)
      setShowMobileSelector(false)
    } catch {
      toast.error('Failed to add item to cart. Please try again.')
    } finally {
      setIsAdding(false)
      setIsAddingVariantId(null)
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
              className={`object-cover transition-all duration-700 ${secondaryImage ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
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

        {/* Mobile-only Quick Add Trigger (Tap to open variants, or direct add if single-variant) */}
        <button
          onClick={handleQuickAdd}
          disabled={isAdding}
          className={`absolute bottom-2.5 right-2.5 h-9 w-9 bg-slate-900/90 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 cursor-pointer z-10 md:hidden ${showMobileSelector ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'
            }`}
          aria-label={hasMultipleVariants ? "Select Options" : "Quick Add to Cart"}
        >
          {isAdding && !isAddingVariantId ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : isSuccess ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : hasMultipleVariants ? (
            <Plus className="h-4 w-4" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </button>

        {/* Desktop-only Single Variant Add to Cart Button */}
        {!hasMultipleVariants && (
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="hidden md:flex absolute inset-x-0 bottom-0 h-11 bg-slate-900/95 hover:bg-slate-900 backdrop-blur-md text-white font-black text-[10px] tracking-widest uppercase items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer z-10 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0"
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : isSuccess ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>Add to Cart — {price != null ? formatPrice(price, currencyCode) : ''}</span>
              </>
            )}
          </button>
        )}

        {/* Quick Add Variant Selector Overlay (Desktop hover / Mobile tap toggle) */}
        {hasMultipleVariants && (
          <div
            className={`absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3.5 flex flex-col gap-2 z-20 transition-all duration-300 transform translate-y-full md:group-hover:translate-y-0 ${showMobileSelector ? 'translate-y-0 shadow-premium' : ''
              }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {/* Selector Title Header */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Select Option to Add
              </span>
            </div>

            {/* Sizing & Pricing Swatches Row (Single-line Horizontal Slider) */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
              {product.variants.map((variant) => {
                const isAddingThis = isAddingVariantId === variant.id
                const vPrice = getVariantPrice(variant)
                const vPriceFormatted = vPrice != null ? formatPrice(vPrice, currencyCode) : ''
                return (
                  <button
                    key={variant.id}
                    onClick={(e) => handleVariantAdd(e, variant.id)}
                    disabled={isAdding}
                    className={`h-8 shrink-0 px-3 rounded-full border text-[10px] uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer select-none disabled:opacity-50 ${isAddingThis
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white bg-white text-slate-800 active:scale-95 hover:shadow-sm'
                      }`}
                  >
                    {isAddingThis ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <span className="font-black leading-none">{variant.title}</span>
                        {vPriceFormatted && (
                          <>
                            <span className="text-[8px] opacity-40 leading-none select-none">•</span>
                            <span className="font-extrabold text-[9px] opacity-80 leading-none">{vPriceFormatted}</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 md:p-5 flex flex-col gap-1 md:gap-2 flex-1">
        <h3 className="font-bold text-slate-900 text-xs md:text-sm leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-[10px] md:text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <div className="mt-auto pt-2 md:pt-3 flex items-center justify-between">
          <span className="text-sm md:text-base font-black text-slate-900">
            {price != null ? formatPrice(price, currencyCode) : '—'}
          </span>
          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {product.variants.length} var{product.variants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </Link>
  )
}
