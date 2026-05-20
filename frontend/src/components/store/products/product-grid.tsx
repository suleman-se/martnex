'use client'

import { ProductCard } from './product-card'
import type { StoreProduct } from '@/hooks/use-products'
import { ShoppingBag } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-states/empty-state'

interface ProductGridProps {
  products: StoreProduct[]
  isLoading?: boolean
  currencyCode?: string
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-slate-100 rounded w-16" />
          <div className="h-3 bg-slate-100 rounded w-12" />
        </div>
      </div>
    </div>
  )
}

export function ProductGrid({ products, isLoading = false, currencyCode = 'usd' }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No Products Found"
        description="Try adjusting your search or removing filters to find what you're looking for."
        className="py-24"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} currencyCode={currencyCode} />
      ))}
    </div>
  )
}
