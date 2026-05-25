'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProductCategory } from '@/hooks/use-product-categories'

interface StoreFiltersProps {
  categories: ProductCategory[]
}

export function StoreFilters({ categories }: StoreFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentQ = searchParams.get('q') ?? ''
  const currentCategory = searchParams.get('category') ?? ''

  const [search, setSearch] = useState(currentQ)
  const [isPending, startTransition] = useTransition()

  // Keep local search input in sync if URL parameter changes
  useEffect(() => {
    setSearch(currentQ)
  }, [currentQ])

  function handleFilterChange(newParams: { q?: string; category?: string; clearQ?: boolean; clearCategory?: boolean }) {
    const params = new URLSearchParams(searchParams.toString())

    // Reset pagination offset whenever filters change
    params.delete('offset')

    if (newParams.clearQ) {
      params.delete('q')
    } else if (newParams.q !== undefined) {
      if (newParams.q) {
        params.set('q', newParams.q)
      } else {
        params.delete('q')
      }
    }

    if (newParams.clearCategory) {
      params.delete('category')
    } else if (newParams.category !== undefined) {
      if (newParams.category) {
        params.set('category', newParams.category)
      } else {
        params.delete('category')
      }
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleFilterChange({ q: search.trim() })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
            {currentCategory
              ? (categories.find((c) => c.handle === currentCategory)?.name ?? 'Products')
              : 'All Products'}
          </h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-11 rounded-2xl border-slate-200 bg-white pl-4 pr-8 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus-visible:ring-slate-900/10"
          />
          {search && (
            <Button
              type="button"
              onClick={() => {
                setSearch('')
                handleFilterChange({ clearQ: true })
              }}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-slate-400 hover:bg-transparent hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </form>
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handleFilterChange({ clearCategory: true })}
            variant="outline"
            className={`h-auto rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${!currentCategory
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
                handleFilterChange({
                  category: currentCategory === cat.handle ? '' : cat.handle,
                })
              }
              variant="outline"
              className={`h-auto rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest transition-all ${currentCategory === cat.handle
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                }`}
            >
              {cat.name}
            </Button>
          ))}
          {currentCategory && (
            <Button
              onClick={() => handleFilterChange({ clearCategory: true })}
              variant="secondary"
              className="h-auto rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-100"
            >
              <X className="h-3 w-3" /> Clear filter
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
