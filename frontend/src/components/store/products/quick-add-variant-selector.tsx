'use client'

import React, { useRef, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { StoreProduct } from '@/lib/api'
import { formatPrice } from '@/lib/api'
import { Button } from '@/components/ui/button'

interface QuickAddVariantSelectorProps {
  productTitle: string
  variants: StoreProduct['variants']
  currencyCode: string
  isAdding: boolean
  isAddingVariantId: string | null
  showMobileSelector: boolean
  setShowMobileSelector: (show: boolean) => void
  getVariantPrice: (variant: StoreProduct['variants'][0]) => number | null
  handleVariantAdd: (e: React.MouseEvent, variantId: string) => void
}

export function QuickAddVariantSelector({
  productTitle,
  variants,
  currencyCode,
  isAdding,
  isAddingVariantId,
  showMobileSelector,
  setShowMobileSelector,
  getVariantPrice,
  handleVariantAdd,
}: QuickAddVariantSelectorProps) {
  const desktopContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showMobileSelector) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopContainerRef.current &&
        !desktopContainerRef.current.contains(event.target as Node)
      ) {
        setShowMobileSelector(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showMobileSelector, setShowMobileSelector])

  if (!showMobileSelector) return null

  return (
    <>
      {/* Desktop-only Quick Add Variant Selector Popover Dropdown (Opens on click/tap, not hover) */}
      <div className="hidden lg:block cursor-default">
        <div
          ref={desktopContainerRef}
          className="absolute inset-x-3 bottom-3 bg-white dark:bg-card border border-slate-100 dark:border-slate-800 rounded-2xl shadow-premium p-3 flex flex-col gap-2.5 z-30 animate-in slide-in-from-bottom-2 duration-300"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {/* Selector Title Header */}
          <div className="flex items-center justify-between shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Select Option
            </span>
            <button
              onClick={() => setShowMobileSelector(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Swatches List */}
          <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto scrollbar-none">
            {variants.map((variant) => {
              const isAddingThis = isAddingVariantId === variant.id
              const vPrice = getVariantPrice(variant)
              const vPriceFormatted = vPrice != null ? formatPrice(vPrice, currencyCode) : ''
              return (
                <Button
                  key={variant.id}
                  onClick={(e) => handleVariantAdd(e, variant.id)}
                  disabled={isAdding}
                  variant={isAddingThis ? "default" : "outline"}
                  className="w-full h-10 px-3.5 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer select-none disabled:opacity-50 text-left"
                >
                  <span className="truncate">{variant.title}</span>
                  {isAddingThis ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0 text-slate-900 dark:text-white" />
                  ) : (
                    vPriceFormatted && <span className="font-extrabold text-[9px] opacity-80 shrink-0">{vPriceFormatted}</span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet slide-up bottom sheet modal (Opens on click/tap, not hover) */}
      <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
        {/* Viewport Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowMobileSelector(false)
          }}
        />
        
        {/* Bottom Sheet Card */}
        <div
          className="relative w-full max-w-lg bg-white dark:bg-card border-t border-slate-100 rounded-t-3xl shadow-2xl p-6 flex flex-col gap-4 z-50 animate-in slide-in-from-bottom duration-300 max-h-[80vh] overflow-y-auto pb-safe"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {/* Sheet Title Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Select Option
              </span>
              <h4 className="font-heading font-black text-slate-900 text-sm mt-0.5 truncate max-w-[280px]">
                {productTitle}
              </h4>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowMobileSelector(false)}
              className="h-8 w-8 rounded-full px-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Swatches List */}
          <div className="flex flex-col gap-2 py-2 overflow-y-auto max-h-[40vh] scrollbar-none">
            {variants.map((variant) => {
              const isAddingThis = isAddingVariantId === variant.id
              const vPrice = getVariantPrice(variant)
              const vPriceFormatted = vPrice != null ? formatPrice(vPrice, currencyCode) : ''
              return (
                <Button
                  key={variant.id}
                  onClick={(e) => handleVariantAdd(e, variant.id)}
                  disabled={isAdding}
                  variant={isAddingThis ? "default" : "outline"}
                  className="w-full h-12 px-4 rounded-2xl text-xs uppercase font-black tracking-wider transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer select-none disabled:opacity-50 text-left"
                >
                  <span className="truncate">{variant.title}</span>
                  {isAddingThis ? (
                    <Loader2 className="h-4 w-4 animate-spin shrink-0 text-slate-900 dark:text-white" />
                  ) : (
                    vPriceFormatted && <span className="font-extrabold text-xs opacity-80 shrink-0">{vPriceFormatted}</span>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
