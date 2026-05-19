'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Menu, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/use-cart'
import { useProductCategories } from '@/hooks/use-product-categories'

export function StoreHeader() {
  const router = useRouter()
  const { itemCount } = useCart()
  const { data: categories } = useProductCategories()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    router.push(q ? `/store?q=${encodeURIComponent(q)}` : '/store')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
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

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search products…"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all"
          />
        </form>

        {/* Category nav — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/store"
            className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
          >
            All
          </Link>
          {categories?.slice(0, 4).map((cat) => (
            <Link
              key={cat.id}
              href={`/store?category=${cat.handle}`}
              className="px-3 py-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Cart icon */}
        <Link
          href="/store/cart"
          className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
          aria-label={`Cart (${itemCount} items)`}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-700"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

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
              className="px-3 py-1.5 text-sm font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
