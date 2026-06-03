'use client'

import React from 'react'
import Image from 'next/image'
import { ShoppingCart, Plus, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductCardMediaProps {
  thumbnail?: string
  secondaryImage?: string
  title: string
  categoryName?: string
  isAdding: boolean
  isSuccess: boolean
  isAddingVariantId: string | null
  hasMultipleVariants: boolean
  showMobileSelector: boolean
  priceFormatted: string
  onQuickAdd: (e: React.MouseEvent) => void
  children?: React.ReactNode
}

export function ProductCardMedia({
  thumbnail,
  secondaryImage,
  title,
  categoryName,
  isAdding,
  isSuccess,
  isAddingVariantId,
  hasMultipleVariants,
  showMobileSelector,
  priceFormatted,
  onQuickAdd,
  children,
}: ProductCardMediaProps) {
  return (
    <div className="relative aspect-square bg-slate-50 overflow-hidden shrink-0">
      {thumbnail ? (
        <>
          {/* Primary Image */}
          <Image
            src={thumbnail}
            alt={title}
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
              alt={`${title} Alternate`}
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
      
      {categoryName && (
        <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm z-10">
          {categoryName}
        </span>
      )}

      {/* Mobile-only Quick Add Trigger (Tap to open variants, or direct add if single-variant) */}
      <Button
        onClick={onQuickAdd}
        disabled={isAdding}
        size="icon"
        variant="outline"
        className={`absolute bottom-2.5 right-2.5 h-9 w-9 bg-white text-slate-900 hover:bg-slate-50! border border-slate-100 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all duration-200 cursor-pointer z-10 lg:hidden ${
          showMobileSelector ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'
        }`}
        aria-label={hasMultipleVariants ? "Select Options" : "Quick Add to Cart"}
      >
        {isAdding && !isAddingVariantId ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSuccess ? (
          <Check className="h-4 w-4 text-emerald-400" />
        ) : hasMultipleVariants ? (
          <Plus className="h-4 w-4" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </Button>

      {/* Desktop-only Single Variant Add to Cart Button */}
      {!hasMultipleVariants && (
        <Button
          onClick={onQuickAdd}
          disabled={isAdding}
          variant="ghost"
          className="hidden lg:flex absolute inset-x-0 bottom-0 h-11 bg-white/90 text-slate-900! hover:text-slate-900! hover:bg-white! border-0 backdrop-blur-md font-black text-[10px] tracking-widest uppercase items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer z-10 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 rounded-none"
        >
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isSuccess ? (
            <>
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Add to Cart — {priceFormatted}</span>
            </>
          )}
        </Button>
      )}

      {/* Desktop-only Multiple Variant Options Hover Button */}
      {hasMultipleVariants && (
        <Button
          onClick={onQuickAdd}
          disabled={isAdding}
          variant="ghost"
          className="hidden lg:flex absolute inset-x-0 bottom-0 h-11 bg-white/90 hover:text-slate-900! hover:bg-white! border-0 backdrop-blur-md font-black text-[10px] tracking-widest uppercase items-center justify-center gap-2 transition-all duration-300 shadow-lg cursor-pointer z-10 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 rounded-none"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Select Options</span>
        </Button>
      )}

      {children}
    </div>
  )
}
