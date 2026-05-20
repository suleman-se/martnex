'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { useMounted } from '@/hooks/use-mounted'
import { useProducts } from '@/hooks/use-products'
import { useProductCategories } from '@/hooks/use-product-categories'
import { ProductGrid } from '@/components/store/products/product-grid'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 16

export default function StorePage() {
  const mounted = useMounted()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const initialCategory = searchParams.get('category') ?? ''

  const [search, setSearch] = useState(initialQ)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [offset, setOffset] = useState(0)

  // Reset pagination when filters change
  useEffect(() => {
    setOffset(0)
  }, [search, selectedCategory])

  const { data: categories } = useProductCategories()

  const categoryId = categories?.find((c) => c.handle === selectedCategory)?.id

  const { data, isLoading } = useProducts({
    q: search || undefined,
    category_id: categoryId ? [categoryId] : undefined,
    limit: PAGE_SIZE,
    offset,
  })

  const products = data?.products ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1

  if (!mounted) return null

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
            {selectedCategory
              ? (categories?.find((c) => c.handle === selectedCategory)?.name ?? 'Products')
              : 'All Products'}
          </h1>
          {!isLoading && (
            <p className="text-slate-400 text-sm font-medium mt-1">
              {totalCount} product{totalCount !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-11 rounded-2xl border-slate-200 bg-white pl-4 pr-8 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus-visible:ring-slate-900/10"
          />
          {search && (
            <Button
              onClick={() => setSearch('')}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-400 hover:bg-transparent hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Category filter chips */}
      {categories && categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedCategory('')}
            variant="outline"
            className={`h-auto rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${
              !selectedCategory
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
            }`}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.handle ? '' : cat.handle)
              }
              variant="outline"
              className={`h-auto rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${
                selectedCategory === cat.handle
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
              }`}
            >
              {cat.name}
            </Button>
          ))}
          {selectedCategory && (
            <Button
              onClick={() => setSelectedCategory('')}
              variant="secondary"
              className="h-auto rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-100"
            >
              <X className="h-3 w-3" /> Clear filter
            </Button>
          )}
        </div>
      )}

      {/* Product grid */}
      <ProductGrid products={products} isLoading={isLoading} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            disabled={currentPage === 1}
            variant="outline"
            className="rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-slate-500 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={() => setOffset(offset + PAGE_SIZE)}
            disabled={currentPage >= totalPages}
            variant="outline"
            className="rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
