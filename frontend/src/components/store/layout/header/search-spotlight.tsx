'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  X,
  Loader2,
  Clock,
  TrendingUp,
  Sparkles,
  CornerDownLeft,
  ChevronRight,
  ShoppingCart,
  Store
} from 'lucide-react'
import { useProducts } from '@/hooks/use-products'
import { useProductCategories } from '@/hooks/use-product-categories'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
import { useUIStore } from '@/hooks/use-ui-store'
import { getDisplayPrice, formatPrice } from '@/lib/api'

interface SearchSpotlightProps {
  isOpen: boolean
  onClose: () => void
  currencyCode: string
}

// Custom matching characters text highlighting component
function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
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

export function SearchSpotlight({ isOpen, onClose, currencyCode }: SearchSpotlightProps) {
  const router = useRouter()
  const { openCart } = useUIStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all')

  const { data: categoriesData } = useProductCategories()
  const categories = categoriesData || []
  
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Reset filters when modal closes/opens or search query is cleared
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategoryId(null)
      setSelectedPriceRange('all')
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSelectedCategoryId(null)
      setSelectedPriceRange('all')
    }
  }, [searchQuery])

  // Prevent background scrolling when search is open
  useBodyScrollLock(isOpen)

  // Global Escape key handler to close modal when not focused on search input
  useEffect(() => {
    if (!isOpen) return

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown, true)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true)
  }, [isOpen, onClose])

  // Debounced search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 200)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Recent searches cache
  useEffect(() => {
    const saved = localStorage.getItem('martnex_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (err) {
        // ignore
      }
    }
  }, [])

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed) return
    const updated = [
      trimmed,
      ...recentSearches.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
    ].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('martnex_recent_searches', JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('martnex_recent_searches')
  }

  // Search Results dynamic fetch
  const { data: searchResults, isLoading } = useProducts({
    q: debouncedQuery.length >= 2 ? debouncedQuery : undefined,
    category_id: selectedCategoryId ? [selectedCategoryId] : undefined,
    limit: 20
  })

  const products = debouncedQuery.length >= 2 ? searchResults?.products || [] : []

  // Filter products by price range client-side
  const filteredProducts = products.filter((product) => {
    if (selectedPriceRange === 'all') return true
    const price = getDisplayPrice(product, currencyCode)
    if (price === null) return false
    if (selectedPriceRange === 'under50') return price < 50
    if (selectedPriceRange === 'under100') return price < 100
    if (selectedPriceRange === 'under200') return price < 200
    return true
  })

  // Navigable items calculation for focus cycle
  const navigableItems =
    searchQuery.length >= 2
      ? filteredProducts.map((p) => ({
          type: 'product',
          id: p.id,
          handle: p.handle,
          title: p.title,
          url: `/store/products/${p.handle}`
        }))
      : [
          ...recentSearches.map((q) => ({
            type: 'recent',
            id: `recent-${q}`,
            query: q,
            url: `/store?q=${encodeURIComponent(q)}`
          })),
          { type: 'action', id: 'act-cart', name: 'View Cart', action: 'cart', url: '#' },
          { type: 'action', id: 'act-sell', name: 'Sell on Martnex', url: '/seller' },
          { type: 'action', id: 'act-all', name: 'All Products', url: '/store' },
          { type: 'category', id: 'cat-apparel', name: 'Apparel', url: '/store?category=apparel' },
          { type: 'category', id: 'cat-footwear', name: 'Footwear', url: '/store?category=footwear' },
          { type: 'category', id: 'cat-lifestyle', name: 'Lifestyle', url: '/store?category=lifestyle' }
        ]

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onClose()
      inputRef.current?.blur()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (navigableItems.length > 0) {
        setFocusedIndex((prev) => (prev < navigableItems.length - 1 ? prev + 1 : 0))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (navigableItems.length > 0) {
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : navigableItems.length - 1))
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIndex >= 0 && navigableItems[focusedIndex]) {
        const selected = navigableItems[focusedIndex]
        if (selected.type === 'product') {
          addRecentSearch(searchQuery)
          router.push(selected.url)
          onClose()
          setSearchQuery('')
        } else if (selected.type === 'recent') {
          setSearchQuery((selected as any).query)
          setFocusedIndex(-1)
        } else if (selected.type === 'category' || selected.type === 'action') {
          if (selected.type === 'action' && (selected as any).action === 'cart') {
            openCart()
          } else {
            router.push(selected.url)
          }
          onClose()
          setSearchQuery('')
        }
      } else {
        const q = searchQuery.trim()
        if (q) {
          addRecentSearch(q)
          router.push(`/store?q=${encodeURIComponent(q)}`)
        } else {
          router.push('/store')
        }
        onClose()
        setSearchQuery('')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-start justify-center md:pt-[10vh] md:px-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative bg-white w-full h-full md:h-auto md:max-h-[80vh] md:max-w-3xl md:rounded-2xl shadow-2xl border-0 md:border md:border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Box */}
        <div className="relative h-14 border-b border-slate-100 flex items-center px-4 gap-3 shrink-0">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Type to search premium products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setFocusedIndex(-1)
            }}
            onKeyDown={handleKeyDown}
            className="w-full h-full text-slate-800 placeholder-slate-400 focus:outline-none text-base border-none"
          />
          <div className="flex items-center gap-2 shrink-0 select-none">
            <span className="hidden md:inline-block border border-slate-200 bg-slate-50 text-slate-450 text-[10px] px-1.5 py-0.5 rounded font-mono shadow-sm">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
              title="Close Search"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search Filters Bar */}
        {searchQuery.length >= 2 && (
          <div className="bg-slate-50/70 border-b border-slate-100 px-4 py-3 flex flex-col gap-2 shrink-0 md:flex-row md:items-center md:justify-between">
            {/* Category Filter Group */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">Category:</span>
              <button
                onClick={() => {
                  setSelectedCategoryId(null)
                  setFocusedIndex(-1)
                }}
                className={`text-[11px] font-extrabold px-3 py-1 rounded-full border transition-all shrink-0 select-none ${
                  selectedCategoryId === null
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm scale-102 font-black hover:bg-slate-800 hover:border-slate-800'
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
                  className={`text-[11px] font-extrabold px-3 py-1 rounded-full border transition-all shrink-0 select-none ${
                    selectedCategoryId === cat.id
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm scale-102 font-black hover:bg-slate-800 hover:border-slate-800'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Price Filter Group */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 border-t border-slate-100/60 pt-2 md:border-t-0 md:pt-0">
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
                  className={`text-[11px] font-extrabold px-3 py-1 rounded-full border transition-all shrink-0 select-none ${
                    selectedPriceRange === p.value
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm scale-102 font-black hover:bg-slate-800 hover:border-slate-800'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-850'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Pane */}
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
                    className="text-[9px] font-bold text-slate-450 hover:text-slate-700 transition-colors"
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
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${
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
                            router.push(act.url)
                          }
                          onClose()
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${
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
          <div className="flex-1 p-5 flex flex-col bg-white md:overflow-y-auto">
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
                            addRecentSearch(searchQuery)
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
                ) : products.length > 0 ? (
                  /* Products found, but none match filters */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-slate-355" />
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
                      className="text-[11px] font-extrabold px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm"
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
      </div>
    </div>
  )
}
