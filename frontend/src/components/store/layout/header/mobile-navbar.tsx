'use client'

import Link from 'next/link'
import { Home, LayoutGrid, Search, ShoppingCart, Store } from 'lucide-react'
import { useUIStore } from '@/hooks/use-ui-store'

interface MobileNavbarProps {
  itemCount: number
  onExploreClick: () => void
  mobileMenuOpen: boolean
}

export function MobileNavbar({
  itemCount,
  onExploreClick,
  mobileMenuOpen
}: MobileNavbarProps) {
  const { openCart } = useUIStore()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 h-16 flex md:hidden items-center justify-around px-4 shadow-premium pb-safe">
      {/* Shop/Home */}
      <Link
        href="/store"
        className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 transition-colors w-12 h-12"
      >
        <Home className="h-5 w-5" />
        <span className="text-[9px] font-bold mt-1">Shop</span>
      </Link>

      {/* Categories trigger */}
      <button
        onClick={onExploreClick}
        className={`flex flex-col items-center justify-center transition-colors w-12 h-12 cursor-pointer ${mobileMenuOpen ? 'text-slate-900 font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
      >
        <LayoutGrid className="h-5 w-5" />
        <span className="text-[9px] font-bold mt-1">Explore</span>
      </button>

      {/* Cart Drawer trigger */}
      <button
        onClick={openCart}
        className="relative flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 transition-colors w-12 h-12 cursor-pointer"
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
        <span className="text-[9px] font-bold mt-1">Cart</span>
      </button>

      {/* Merchant Center */}
      <Link
        href="/seller"
        className="flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 transition-colors w-12 h-12"
      >
        <Store className="h-5 w-5" />
        <span className="text-[9px] font-bold mt-1">Merchant</span>
      </Link>
    </div>
  )
}
