'use client'

import React from 'react'
import { useProducts } from '@/hooks/use-products'
import { ProductCard } from '@/components/store/products/product-card'
import { Loader2, Sparkles } from 'lucide-react'

interface RecommendationsCarouselProps {
  currentProductId: string
  categoryId?: string
  currencyCode: string
}

export function RecommendationsCarousel({
  currentProductId,
  categoryId,
  currencyCode
}: RecommendationsCarouselProps) {
  // Query other products in the same category
  const { data: categoryData, isLoading: isCategoryLoading } = useProducts({
    category_id: categoryId ? [categoryId] : undefined,
    limit: 8
  })

  // Fallback: Query all products in the store if category yields nothing or is missing
  const { data: fallbackData, isLoading: isFallbackLoading } = useProducts({
    limit: 8
  })

  const isLoading = isCategoryLoading || isFallbackLoading

  // Resolve products: prioritize category matches, fallback to general catalog products if empty
  const candidates = categoryData?.products && categoryData.products.length > 1
    ? categoryData.products
    : fallbackData?.products || []

  // Filter out the active product being viewed to prevent self-recommendation
  const recommended = candidates.filter((p) => p.id !== currentProductId).slice(0, 4)

  if (isLoading) {
    return (
      <div className="border-t border-slate-100 mt-12 pt-12 flex items-center justify-center min-h-[160px]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  // If no recommendations are available, hide the panel cleanly
  if (recommended.length === 0) return null

  return (
    <div className="border-t border-slate-100 mt-12 pt-12 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-slate-400" />
        <h3 className="text-lg font-black tracking-tight text-slate-900">
          You May Also Like
        </h3>
      </div>

      {/* Horizontal Touch Scroll Snap Panel */}
      <div className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-none pb-4 snap-x -mx-6 px-6 md:mx-0 md:px-0">
        {recommended.map((product) => (
          <div
            key={product.id}
            className="w-[190px] md:w-[245px] shrink-0 snap-start"
          >
            <ProductCard product={product} currencyCode={currencyCode} />
          </div>
        ))}
      </div>
    </div>
  )
}
