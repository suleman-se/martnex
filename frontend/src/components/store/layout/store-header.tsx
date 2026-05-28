'use client'

import Link from 'next/link'
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  Store
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useCart } from '@/hooks/use-cart'
import { useProductCategories } from '@/hooks/use-product-categories'
import { useRegions } from '@/hooks/use-regions'
import { useUIStore } from '@/hooks/use-ui-store'
import { Button } from '@/components/ui/button'

import { SearchSpotlight } from './header/search-spotlight'
import { CategoryMegaMenu } from './header/category-mega-menu'
import { MobileCategoryDrawer } from './header/mobile-category-drawer'
import { MobileNavbar } from './header/mobile-navbar'
import { ThemeToggle } from './header/theme-toggle'

export function StoreHeader() {
  const { itemCount } = useCart()
  const { data: categories } = useProductCategories()
  const { openCart } = useUIStore()
  const { defaultRegion } = useRegions()
  const currencyCode = defaultRegion?.currency_code || 'usd'

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [cartBounce, setCartBounce] = useState(false)

  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const prevItemCountRef = useRef(itemCount)

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Global keyboard shortcuts (⌘K, Ctrl+K, /)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown, true)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true)
  }, [])

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

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md transition-all duration-300 ${
          isScrolled
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
          <div className="flex flex-1 max-w-xl relative">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full relative h-10 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 px-4 flex items-center justify-between text-sm text-slate-450 transition-all duration-305 shadow-sm cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-slate-400">Search products…</span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <kbd className="border border-slate-200 bg-white text-slate-450 text-[10px] px-1.5 py-0.5 rounded font-mono shadow-sm">
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
                      className={`absolute bottom-0 left-3 right-3 h-[2px] bg-slate-900 transition-transform duration-300 origin-left ${
                        activeMenu === cat.handle
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
          <div className="flex items-center gap-2.5 md:gap-3 shrink-0 ml-auto">
            {/* Sell on Martnex Capsule */}
            <Link
              href="/seller"
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 hover:border-slate-800 text-xs font-bold text-slate-500 hover:text-slate-950 transition-all hover:bg-slate-50/50"
            >
              <Store className="h-3.5 w-3.5" />
              <span>Sell on Martnex</span>
            </Link>

            {/* Premium Theme Switcher */}
            <ThemeToggle />

            {/* Cart Icon trigger button */}
            <button
              onClick={openCart}
              className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0 cursor-pointer"
              aria-label={`Cart (${itemCount} items)`}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span
                  className={`absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center ${
                    cartBounce ? 'animate-bounce-spring' : 'animate-in zoom-in duration-300'
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
          <CategoryMegaMenu
            activeMenu={activeMenu}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onNavigate={() => setActiveMenu(null)}
          />
        )}
      </header>

      {/* Mobile slide-up Category Exploration Sheet using unified Drawer component */}
      <MobileCategoryDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={categories || []}
      />

      {/* Spotlight Command Palette Modal */}
      <SearchSpotlight
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        currencyCode={currencyCode}
      />

      {/* Sticky Bottom App-like Navigation Bar for Mobile */}
      <MobileNavbar
        itemCount={itemCount}
        onExploreClick={() => setMobileMenuOpen((o) => !o)}
        mobileMenuOpen={mobileMenuOpen}
      />
    </>
  )
}
