'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Clock,
  ShoppingCart,
  Store,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Loader2,
  CornerDownLeft,
  Search
} from 'lucide-react'
import type { StoreProduct } from '@/lib/api'
import { getDisplayPrice, formatPrice } from '@/lib/api'

// Custom matching characters text highlighting component
export function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-100 text-amber-950 font-bold rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}

interface SearchResultsListProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  recentSearches: string[]
  clearRecentSearches: () => void
  focusedIndex: number
  setFocusedIndex: (idx: number) => void
  isLoading: boolean
  filteredProducts: StoreProduct[]
  productsLength: number
  onClose: () => void
  openCart: () => void
  currencyCode: string
  setSelectedCategoryId: (id: string | null) => void
  setSelectedPriceRange: (range: string) => void
}

export function SearchResultsList({
  searchQuery,
  setSearchQuery,
  recentSearches,
  clearRecentSearches,
  focusedIndex,
  setFocusedIndex,
  isLoading,
  filteredProducts,
  productsLength,
  onClose,
  openCart,
  currencyCode,
  setSelectedCategoryId,
  setSelectedPriceRange,
}: SearchResultsListProps) {
  return (
    <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-y-auto md:overflow-hidden flex-1 md:h-[400px]">
      {/* Left Pane (Discover Panel - 1/3) */}
      <div className="w-full md:w-64 shrink-0 bg-slate-50/50 p-4 space-y-6 flex flex-col md:overflow-y-auto">
        {/* Recent Searches */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            <span>Recent Searches</span>
            {recentSearches.length > 0 && (
              <button
                onClick={clearRecentSearches}
                className="text-[9px] font-bold text-slate-450 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          {recentSearches.length > 0 ? (
            <ul className="space-y-1">
              {recentSearches.map((q, idx) => {
                const isFocused = focusedIndex === idx
                return (
                  <li key={q}>
                    <button
                      onClick={() => {
                        setSearchQuery(q)
                        setFocusedIndex(-1)
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                        isFocused
                          ? 'bg-slate-150 text-slate-900 font-bold shadow-sm'
                          : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{q}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-[10px] text-slate-400 italic px-2.5">No recent searches</p>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Quick Actions
          </h5>
          <ul className="space-y-1">
            {[
              { name: 'View Cart', action: 'cart', icon: ShoppingCart },
              { name: 'Sell on Martnex', url: '/seller', icon: Store },
              { name: 'All Products', url: '/store', icon: Sparkles }
            ].map((act, idx) => {
              const itemIdx = recentSearches.length + idx
              const isFocused = focusedIndex === itemIdx
              const Icon = act.icon
              return (
                <li key={act.name}>
                  <button
                    onClick={() => {
                      if (act.action === 'cart') {
                        openCart()
                      } else if (act.url) {
                        window.location.href = act.url
                      }
                      onClose()
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                      isFocused
                        ? 'bg-slate-150 text-slate-900 font-bold shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-800'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{act.name}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Right Pane (Live Matches or Trending Categories - 2/3) */}
      <div className="flex-1 p-5 flex flex-col bg-white dark:bg-card md:overflow-y-auto">
        {searchQuery.length < 2 ? (
          /* EMPTY QUERY: Display Trending Categories */
          <div className="space-y-6 flex-1 flex flex-col justify-center">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
                Trending Categories
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Apparel', handle: 'apparel', desc: 'Premium outerwear & streetwear' },
                  { name: 'Footwear', handle: 'footwear', desc: 'Performance & rugged leather' },
                  { name: 'Lifestyle', handle: 'lifestyle', desc: 'Audio tech & daily travel packs' }
                ].map((cat, idx) => {
                  const itemIdx = recentSearches.length + 3 + idx
                  const isFocused = focusedIndex === itemIdx
                  return (
                    <Link
                      key={cat.handle}
                      href={`/store?category=${cat.handle}`}
                      onClick={onClose}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 group/cat ${
                        isFocused
                          ? 'bg-slate-50 border-slate-350 scale-[1.02] shadow-sm'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/30'
                      }`}
                    >
                      <div>
                        <h5 className="text-xs font-black text-slate-800 mb-1 group-hover/cat:text-slate-950">
                          {cat.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 leading-normal line-clamp-2">
                          {cat.desc}
                        </p>
                      </div>
                      <span className="text-[9px] font-black text-slate-400 group-hover/cat:text-slate-900 flex items-center gap-0.5">
                        Browse <ChevronRight className="h-2.5 w-2.5" />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0">
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <div>
                <h5 className="text-xs font-black text-slate-850">
                  Looking for something specific?
                </h5>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Type at least 2 characters to search across sizes, colors, and premium options.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE QUERY: Live Search Results */
          <div className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="flex flex-col divide-y divide-slate-50 flex-1">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 px-1">
                  Product Results ({filteredProducts.length})
                </div>
                {filteredProducts.map((product, index) => {
                  const price = getDisplayPrice(product, currencyCode)
                  const isFocused = focusedIndex === index
                  return (
                    <Link
                      key={product.id}
                      href={`/store/products/${product.handle}`}
                      onClick={() => {
                        // Safe dispatch for recent searches
                        if (typeof window !== 'undefined') {
                          const saved = localStorage.getItem('martnex_recent_searches')
                          const recent = saved ? JSON.parse(saved) : []
                          const trimmed = searchQuery.trim()
                          if (trimmed) {
                            const updated = [
                              trimmed,
                              ...recent.filter((q: string) => q.toLowerCase() !== trimmed.toLowerCase())
                            ].slice(0, 5)
                            localStorage.setItem('martnex_recent_searches', JSON.stringify(updated))
                          }
                        }
                        onClose()
                        setSearchQuery('')
                      }}
                      className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all border ${
                        isFocused
                          ? 'bg-slate-50 border-slate-200 scale-[1.01] shadow-sm'
                          : 'border-transparent hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 shadow-sm">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.title}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingCart className="h-4 w-4 text-slate-300 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-800 truncate">
                          <HighlightedText text={product.title} highlight={searchQuery} />
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {product.variants.length} variant
                            {product.variants.length !== 1 ? 's' : ''}
                          </span>
                          {product.categories?.[0] && (
                            <>
                              <span className="h-1 w-1 rounded-full bg-slate-200" />
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                                {product.categories[0].name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-black text-slate-900">
                          {price != null ? formatPrice(price, currencyCode) : '—'}
                        </span>
                        {isFocused && (
                          <CornerDownLeft className="h-3.5 w-3.5 text-slate-400 animate-pulse" />
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : productsLength > 0 ? (
              /* Products found, but none match filters */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-slate-350" />
                </div>
                <h5 className="text-xs font-black text-slate-800">
                  No products match selected filters
                </h5>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mb-4">
                  Try clearing or adjusting your category or price range filters to see matching results.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategoryId(null)
                    setSelectedPriceRange('all')
                    setFocusedIndex(-1)
                  }}
                  className="text-[11px] font-extrabold px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* No products found at all */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-slate-300" />
                </div>
                <h5 className="text-xs font-black text-slate-800">
                  No matching products found
                </h5>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[240px]">
                  We couldn&apos;t find anything matching &ldquo;{searchQuery}&rdquo;. Try another term.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
