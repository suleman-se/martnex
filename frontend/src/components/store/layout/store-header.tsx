'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Loader2,
  Clock,
  TrendingUp,
  Sparkles,
  CornerDownLeft,
  ChevronRight,
  Store,
  ArrowRight
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'
import { useProductCategories } from '@/hooks/use-product-categories'
import { useProducts } from '@/hooks/use-products'
import { useRegions } from '@/hooks/use-regions'
import { useUIStore } from '@/hooks/use-ui-store'
import { getDisplayPrice, formatPrice } from '@/lib/api'
import { Button } from '@/components/ui/button'

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

function getMenuSubcategories(menu: string): string[] {
  switch (menu) {
    case 'apparel':
      return ["Jackets & Outerwear", "Oversized Streetwear", "Tailored Suitwear", "New Season Tops"]
    case 'footwear':
      return ["Athletic & Running", "Lugged Leather Boots", "Casual Slip-Ons", "Minimalist Slides"]
    case 'lifestyle':
      return ["Audio & Acoustics", "Leather Carrypacks", "Daily Essentials", "Desk Accessories"]
    default:
      return []
  }
}

function getFeaturedProduct(menu: string) {
  switch (menu) {
    case 'apparel':
      return {
        name: "Urban Oversized Hoodie",
        price: "$89.00",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300&auto=format&fit=crop",
        url: "/store/products/urban-oversized-hoodie",
        tag: "Premium Curation"
      }
    case 'footwear':
      return {
        name: "Apex Knit Sneakers",
        price: "$120.00",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop",
        url: "/store/products/apex-knit-sneakers",
        tag: "Best Seller"
      }
    case 'lifestyle':
      return {
        name: "Acoustic Active ANC Headphones",
        price: "$249.00",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop",
        url: "/store/products/acoustic-active-anc-headphones",
        tag: "Award Winning"
      }
    default:
      return {
        name: "",
        price: "",
        image: "",
        url: "",
        tag: ""
      }
  }
}

export function StoreHeader() {
  const router = useRouter()
  const { itemCount } = useCart()
  const { data: categories } = useProductCategories()
  const { openCart } = useUIStore()
  const { defaultRegion } = useRegions()
  const currencyCode = defaultRegion?.currency_code || 'usd'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isScrolled, setIsScrolled] = useState(false)

  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [cartBounce, setCartBounce] = useState(false)
  const prevItemCountRef = useRef(itemCount)

  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Debounced search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 200)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Global keyboard shortcuts (⌘K, Ctrl+K, /, Escape)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
        inputRef.current?.blur()
        return
      }

      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable

      if (isInput) return

      if (
        (e.metaKey && e.key.toLowerCase() === 'k') ||
        (e.ctrlKey && e.key.toLowerCase() === 'k') ||
        e.key === '/'
      ) {
        e.preventDefault()
        setIsSearchOpen(true)
        setTimeout(() => {
          inputRef.current?.focus()
        }, 50)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isSearchOpen])

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

  // Cart bubble bounce trigger
  useEffect(() => {
    if (itemCount > prevItemCountRef.current) {
      setCartBounce(true)
      const timer = setTimeout(() => setCartBounce(false), 400)
      return () => clearTimeout(timer)
    }
    prevItemCountRef.current = itemCount
  }, [itemCount])

  // Hover mega-menu handlers
  const handleMouseEnter = (menu: string) => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    setActiveMenu(menu)
  }

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null)
    }, 150)
  }

  // Search Results dynamic fetch
  const { data: searchResults, isLoading } = useProducts({
    q: debouncedQuery.length >= 2 ? debouncedQuery : undefined,
    limit: 5
  })

  const products = debouncedQuery.length >= 2 ? searchResults?.products || [] : []

  // Navigable items calculation for focus cycle
  const navigableItems =
    searchQuery.length >= 2
      ? products.map((p) => ({
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
      setIsSearchOpen(false)
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
          setIsSearchOpen(false)
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
          setIsSearchOpen(false)
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
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-300 ${isScrolled
            ? 'border-b border-transparent shadow-premium'
            : 'border-b border-slate-100 shadow-sm'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/store" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-8 w-8 bg-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold text-sm transition-transform group-hover:rotate-3 duration-300">
              M
            </div>
            <span className="font-heading font-black text-slate-900 text-lg hidden sm:block">
              Martnex
            </span>
          </Link>

          {/* Fake Search Input (Spotlight Trigger) */}
          <div className="flex-1 max-w-xl relative">
            <button
              onClick={() => {
                setIsSearchOpen(true)
                setTimeout(() => inputRef.current?.focus(), 50)
              }}
              className="w-full relative h-10 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 px-4 flex items-center justify-between text-sm text-slate-450 transition-all duration-305 shadow-sm cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-400">Search products…</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <kbd className="border border-slate-200 bg-white text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-mono shadow-sm">
                  ⌘K
                </kbd>
              </div>
            </button>
          </div>

          {/* Category nav — desktop with Hover Mega Dropdown */}
          <nav className="hidden md:flex items-center gap-2 h-16 shrink-0">
            <div className="h-full flex items-center">
              <Link
                href="/store"
                className="relative px-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors group/nav"
              >
                <span>All</span>
                <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-slate-900 scale-x-0 group-hover/nav:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            </div>
            {categories?.slice(0, 4).map((cat) => {
              const hasMega = ['apparel', 'footwear', 'lifestyle'].includes(cat.handle)
              return (
                <div
                  key={cat.id}
                  className="h-full flex items-center"
                  onMouseEnter={() => hasMega && handleMouseEnter(cat.handle)}
                  onMouseLeave={hasMega ? handleMouseLeave : undefined}
                >
                  <Link
                    href={`/store?category=${cat.handle}`}
                    className="relative px-3 py-2 text-sm font-semibold text-slate-500 hover:text-slate-950 transition-colors whitespace-nowrap group/nav"
                  >
                    <span>{cat.name}</span>
                    <span
                      className={`absolute bottom-0 left-3 right-3 h-[2px] bg-slate-900 transition-transform duration-300 origin-left ${activeMenu === cat.handle
                          ? 'scale-x-100'
                          : 'scale-x-0 group-hover/nav:scale-x-100'
                        }`}
                    />
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Portal Link & Cart */}
          <div className="flex items-center gap-3 shrink-0 ml-auto">
            {/* Sell on Martnex Capsule */}
            <Link
              href="/seller"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-900 transition-all hover:bg-slate-50/50"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Sell on Martnex</span>
            </Link>

            {/* Cart Icon trigger button */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0 cursor-pointer"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center ${cartBounce ? 'animate-bounce-spring' : 'animate-in zoom-in duration-300'
                    }`}
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <Button
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-700"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              variant="ghost"
              size="icon"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Visual Mega Dropdown component */}
        {activeMenu && (
          <div
            className="absolute top-16 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-premium animate-in fade-in slide-in-from-top-2 duration-200 z-40 py-8 px-6"
            onMouseEnter={() => handleMouseEnter(activeMenu)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-4 gap-8">
              {/* Subcategories (Columns 1 & 2) */}
              <div className="col-span-2 grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-450 mb-4">
                    Collections
                  </h4>
                  <ul className="space-y-3">
                    {getMenuSubcategories(activeMenu)
                      .slice(0, 2)
                      .map((sub, idx) => (
                        <li key={idx}>
                          <Link
                            href={`/store?category=${activeMenu}`}
                            onClick={() => setActiveMenu(null)}
                            className="text-sm font-bold text-slate-750 hover:text-slate-950 transition-colors flex items-center gap-1.5 group/sub"
                          >
                            <span>{sub}</span>
                            <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all text-slate-400" />
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-450 mb-4">
                    Shop By Fit
                  </h4>
                  <ul className="space-y-3">
                    {getMenuSubcategories(activeMenu)
                      .slice(2, 4)
                      .map((sub, idx) => (
                        <li key={idx}>
                          <Link
                            href={`/store?category=${activeMenu}`}
                            onClick={() => setActiveMenu(null)}
                            className="text-sm font-bold text-slate-750 hover:text-slate-950 transition-colors flex items-center gap-1.5 group/sub"
                          >
                            <span>{sub}</span>
                            <ChevronRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all text-slate-400" />
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Curation info (Column 3) */}
              <div className="flex flex-col justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    Curation
                  </span>
                  <h5 className="text-sm font-black text-slate-900 mt-3 mb-2">
                    The {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)} Edit
                  </h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Discover independent, ethically-crafted products from our verified premium vendors.
                  </p>
                </div>
                <Link
                  href={`/store?category=${activeMenu}`}
                  onClick={() => setActiveMenu(null)}
                  className="text-xs font-black text-slate-900 hover:underline flex items-center gap-1 mt-4 group"
                >
                  View All {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Featured Product Card (Column 4) */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col group/card">
                {(() => {
                  const fp = getFeaturedProduct(activeMenu)
                  return (
                    <Link
                      href={fp.url}
                      onClick={() => setActiveMenu(null)}
                      className="flex flex-col h-full"
                    >
                      <div className="relative h-32 bg-slate-100 overflow-hidden shrink-0">
                        <Image
                          src={fp.image}
                          alt={fp.name}
                          fill
                          sizes="(max-width: 300px) 100vw, 300px"
                          className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <span className="absolute top-2.5 right-2.5 text-[8px] font-black uppercase tracking-widest bg-white/90 backdrop-blur-sm text-slate-800 px-2 py-0.5 rounded shadow-sm">
                          {fp.tag}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h6 className="text-xs font-black text-slate-800 truncate mb-1">
                            {fp.name}
                          </h6>
                          <span className="text-xs font-black text-slate-900">
                            {fp.price}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 group-hover/card:text-slate-900 transition-colors mt-2">
                          Shop Now →
                        </span>
                      </div>
                    </Link>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Mobile category nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 px-6 py-3 flex flex-wrap gap-2 bg-white">
            <Link
              href="/store"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 text-sm font-semibold text-slate-700 bg-slate-50 rounded-full"
            >
              All Products
            </Link>
            {categories?.map((cat) => (
              <Link
                key={cat.id}
                href={`/store?category=${cat.handle}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 text-sm font-semibold text-slate-555 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/seller"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-1.5 text-sm font-semibold text-slate-555 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors flex items-center gap-1 w-full mt-2 border border-dashed border-slate-200"
            >
              <Store className="h-4 w-4" />
              <span>Merchant Portal</span>
            </Link>
          </div>
        )}
      </header>

      {/* Spotlight Command Palette Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[100] flex items-start justify-center pt-[10vh] px-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsSearchOpen(false)
            }
          }}
        >
          <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200 max-h-[80vh]">
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
              <div className="flex items-center gap-1.5 shrink-0 select-none">
                <span className="border border-slate-200 bg-slate-50 text-slate-450 text-[10px] px-1.5 py-0.5 rounded font-mono shadow-sm">
                  ESC
                </span>
              </div>
            </div>

            {/* Content Pane */}
            <div className="flex divide-x divide-slate-100 overflow-hidden h-[400px]">
              {/* Left Pane (Discover Panel - 1/3) */}
              <div className="w-64 shrink-0 bg-slate-50/50 p-4 space-y-6 flex flex-col overflow-y-auto">
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
                              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${isFocused
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
                    <p className="text-[10px] text-slate-400 italic px-2.5">
                      No recent searches
                    </p>
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
                              setIsSearchOpen(false)
                            }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${isFocused
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
              <div className="flex-1 p-5 overflow-y-auto flex flex-col bg-white">
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
                              onClick={() => setIsSearchOpen(false)}
                              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 group/cat ${isFocused
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
                    ) : products.length > 0 ? (
                      <div className="flex flex-col divide-y divide-slate-50 flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 px-1">
                          Product Results
                        </div>
                        {products.map((product, index) => {
                          const price = getDisplayPrice(product, currencyCode)
                          const isFocused = focusedIndex === index
                          return (
                            <Link
                              key={product.id}
                              href={`/store/products/${product.handle}`}
                              onClick={() => {
                                addRecentSearch(searchQuery)
                                setIsSearchOpen(false)
                                setSearchQuery('')
                              }}
                              className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all border ${isFocused
                                  ? 'bg-slate-50 border-slate-205 scale-[1.01] shadow-sm'
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
                    ) : (
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
      )}
    </>
  )
}
