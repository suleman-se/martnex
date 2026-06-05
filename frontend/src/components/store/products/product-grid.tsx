'use client'

import { ProductCard } from './product-card'
import { StoreProduct } from '@/lib/api'
import { ShoppingBag } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { SkeletonGrid } from '@/components/shared/skeletons'

interface ProductGridProps {
  products: StoreProduct[]
  isLoading?: boolean
  currencyCode?: string
}

export function ProductGrid({ products, isLoading = false, currencyCode = 'usd' }: ProductGridProps) {
  if (isLoading) {
    return <SkeletonGrid count={8} />
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} currencyCode={currencyCode} />
      ))}
    </div>
  )
}
