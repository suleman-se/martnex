'use client'

import React from 'react'
import type { ProductCategory } from '@/lib/api'

interface SearchFiltersProps {
  selectedCategoryId: string | null
  setSelectedCategoryId: (id: string | null) => void
  selectedPriceRange: string
  setSelectedPriceRange: (range: string) => void
  categories: ProductCategory[]
  setFocusedIndex: (idx: number) => void
}

export function SearchFilters({
  selectedCategoryId,
  setSelectedCategoryId,
  selectedPriceRange,
  setSelectedPriceRange,
  categories,
  setFocusedIndex,
}: SearchFiltersProps) {
  return (
    <div className="bg-slate-50/70 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex flex-col gap-2 shrink-0 md:flex-row md:items-center md:justify-between">
      {/* Category Filter Group */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Category:</span>
        <button
          onClick={() => {
            setSelectedCategoryId(null)
            setFocusedIndex(-1)
          }}
          className={`text-[11px] font-extrabold px-3 py-1 rounded-full border transition-all shrink-0 select-none cursor-pointer ${
            selectedCategoryId === null
              ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 shadow-sm scale-102 font-black hover:bg-slate-800 dark:hover:bg-slate-200 hover:border-slate-800 dark:hover:border-slate-200'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-800'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategoryId(cat.id)
              setFocusedIndex(-1)
            }}
            className={`text-[11px] font-extrabold px-3 py-1 rounded-full border transition-all shrink-0 select-none cursor-pointer ${
              selectedCategoryId === cat.id
                ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 shadow-sm scale-102 font-black hover:bg-slate-800 dark:hover:bg-slate-200 hover:border-slate-800 dark:hover:border-slate-200'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Price Filter Group */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 border-t border-slate-100/60 dark:border-slate-800 pt-2 md:border-t-0 md:pt-0">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Price:</span>
        {[
          { label: 'Any Price', value: 'all' },
          { label: 'Under $50', value: 'under50' },
          { label: 'Under $100', value: 'under100' },
          { label: 'Under $200', value: 'under200' }
        ].map((p) => (
          <button
            key={p.value}
            onClick={() => {
              setSelectedPriceRange(p.value)
              setFocusedIndex(-1)
            }}
            className={`text-[11px] font-extrabold px-3 py-1 rounded-full border transition-all shrink-0 select-none cursor-pointer ${
              selectedPriceRange === p.value
                ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 shadow-sm scale-102 font-black hover:bg-slate-800 dark:hover:bg-slate-200 hover:border-slate-800 dark:hover:border-slate-200'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-850 hover:text-slate-800'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
