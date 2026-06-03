'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProductCategories } from '@/hooks/use-product-categories'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
import { useUIStore } from '@/hooks/use-ui-store'
import { useProducts } from '@/hooks/use-products'
import { getDisplayPrice } from '@/lib/api'

import { SearchInput } from './search-input'
import { SearchFilters } from './search-filters'
import { SearchResultsList } from './search-results-list'


interface SearchSpotlightProps {
  isOpen: boolean
  onClose: () => void
  currencyCode: string
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

  // Global Escape key handler to close modal
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

  // Recent searches cache loader
  useEffect(() => {
    const saved = localStorage.getItem('martnex_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (err) {
        // ignore
      }
    }
  }, [isOpen])

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

  // Live matching products query
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

  // Navigable items count for keyboard arrow cycle
  const navigableItems =
    searchQuery.length >= 2
      ? filteredProducts.map((p) => ({
          type: 'product',
          url: `/store/products/${p.handle}`
        }))
      : [
          ...recentSearches.map((q) => ({
            type: 'recent',
            url: `/store?q=${encodeURIComponent(q)}`
          })),
          { type: 'action', url: '#' },
          { type: 'action', url: '/seller' },
          { type: 'action', url: '/store' }
        ]

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onClose()
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
        } else if (selected.type === 'action') {
          if (selected.url === '#') {
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
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-start justify-center md:pt-[10vh] md:px-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative bg-white dark:bg-card w-full h-full md:h-auto md:max-h-[80vh] md:max-w-3xl md:rounded-2xl shadow-2xl border-0 md:border md:border-slate-100 dark:md:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onClose={onClose}
          onKeyDown={handleKeyDown}
          setFocusedIndex={setFocusedIndex}
        />

        {searchQuery.length >= 2 && (
          <SearchFilters
            selectedCategoryId={selectedCategoryId}
            setSelectedCategoryId={setSelectedCategoryId}
            selectedPriceRange={selectedPriceRange}
            setSelectedPriceRange={setSelectedPriceRange}
            categories={categories}
            setFocusedIndex={setFocusedIndex}
          />
        )}

        <SearchResultsList
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          recentSearches={recentSearches}
          clearRecentSearches={clearRecentSearches}
          focusedIndex={focusedIndex}
          setFocusedIndex={setFocusedIndex}
          isLoading={isLoading}
          filteredProducts={filteredProducts}
          productsLength={products.length}
          onClose={onClose}
          openCart={openCart}
          currencyCode={currencyCode}
          setSelectedCategoryId={setSelectedCategoryId}
          setSelectedPriceRange={setSelectedPriceRange}
        />
      </div>
    </div>
  )
}
