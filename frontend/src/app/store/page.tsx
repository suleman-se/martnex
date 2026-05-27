import { fetchProducts, fetchProductCategories } from '@/lib/api'
import { ProductGrid } from '@/components/store/products/product-grid'
import { StoreFilters } from '@/components/store/store-filters'
import { StorePagination } from '@/components/store/store-pagination'
import { StoreEditorialHero } from '@/components/store/layout/store-editorial-hero'
import { AlertCircle } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-states/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const PAGE_SIZE = 16

interface StorePageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    offset?: string
  }>
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const resolvedParams = await searchParams
  const q = resolvedParams.q ?? ''
  const category = resolvedParams.category ?? ''
  const offsetStr = resolvedParams.offset ?? '0'
  const offset = parseInt(offsetStr, 10) || 0

  let categories: any[] = []
  let products: any[] = []
  let count = 0

  try {
    categories = await fetchProductCategories()
    const activeCategory = categories.find((c) => c.handle === category)
    const categoryId = activeCategory?.id

    const data = await fetchProducts({
      q: q || undefined,
      category_id: categoryId ? [categoryId] : undefined,
      limit: PAGE_SIZE,
      offset,
    })
    products = data.products
    count = data.count
  } catch (err) {
    console.error('StorePage fetch failed:', err)
    return (
      <div className="space-y-8 animate-in fade-in duration-700 max-w-2xl mx-auto py-12">
        <EmptyState
          icon={AlertCircle}
          title="Store Temporarily Offline"
          description="We are unable to connect to the store backend at this moment. Please verify that the database and Medusa backend services are active."
          className="py-24 opacity-100 bg-white border border-slate-100 rounded-3xl p-12 shadow-sm"
          action={
            <Button asChild className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-black uppercase tracking-widest hover:bg-slate-800">
              <Link href="/store">Retry Connection</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Editorial Landing Hero: Visible on landing view without filters/searches */}
      {!q && !category && offset === 0 && <StoreEditorialHero />}

      {/* Filter and search controls (Client component for interactive states) */}
      <StoreFilters categories={categories} />

      {/* Product count label */}
      <p className="text-slate-400 text-sm font-medium -mt-4">
        {count} product{count !== 1 ? 's' : ''} available
      </p>

      {/* Product grid server-passed products list */}
      <ProductGrid products={products} />

      {/* Pagination controls */}
      <StorePagination totalCount={count} pageSize={PAGE_SIZE} offset={offset} />
    </div>
  )
}
