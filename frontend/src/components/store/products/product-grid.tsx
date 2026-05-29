'use client'

import { ProductCard } from './product-card'
import type { StoreProduct } from '@/hooks/use-products'
import { ShoppingBag } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Skeletonify } from '@/components/shared/skeletons'

interface ProductGridProps {
  products: StoreProduct[]
  isLoading?: boolean
  currencyCode?: string
}

const MOCK_PRODUCT: any = {
  id: 'mock-id',
  title: 'Loading Premium Item',
  handle: 'mock-handle',
  thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=150',
  description: 'Placeholder description for loading shimmers',
  variants: [
    {
      id: 'var-1',
      title: 'Default',
      prices: [{ id: 'p-1', amount: 89.00, currency_code: 'usd' }],
      options: []
    }
  ],
  options: [
    {
      id: 'opt-1',
      title: 'Size',
      values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }]
    }
  ],
  images: []
}

export function ProductGrid({ products, isLoading = false, currencyCode = 'usd' }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeletonify key={i}>
            <ProductCard product={MOCK_PRODUCT} currencyCode={currencyCode} />
          </Skeletonify>
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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} currencyCode={currencyCode} />
      ))}
    </div>
  )
}
