'use client'

import Link from 'next/link'
import { X, ChevronRight, Store } from 'lucide-react'
import { Drawer } from '@/components/shared/drawer'
import type { ProductCategory } from '@/lib/api'

interface MobileCategoryDrawerProps {
  isOpen: boolean
  onClose: () => void
  categories: ProductCategory[]
}

export function MobileCategoryDrawer({
  isOpen,
  onClose,
  categories
}: MobileCategoryDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="bottom"
      showCloseButton={false}
    >
      <div className="relative bg-white w-full flex flex-col p-6 pb-24">
        {/* Pull Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
        
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h3 className="font-heading font-black text-slate-900 text-lg">Explore Categories</h3>
            <p className="text-xs text-slate-400">Premium curated collections</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collections Grid */}
        <div className="space-y-4">
          <Link
            href="/store"
            onClick={onClose}
            className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-900 px-2.5 text-white rounded-xl flex items-center justify-center font-bold">
                All
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">All Collections</h4>
                <p className="text-[10px] text-slate-450">Browse everything in our storefront</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {categories?.map((cat) => {
            // Curated description
            let desc = "Curated premium items"
            if (cat.handle === 'apparel') desc = "Jackets, oversized streetwear & tops"
            else if (cat.handle === 'footwear') desc = "Athletic knit sneakers & boots"
            else if (cat.handle === 'lifestyle') desc = "Audio tech & daily carrypacks"

            return (
              <Link
                key={cat.id}
                href={`/store?category=${cat.handle}`}
                onClick={onClose}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-150 text-slate-850 rounded-xl flex items-center justify-center font-black uppercase text-xs">
                    {cat.name.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{cat.name}</h4>
                    <p className="text-[10px] text-slate-450">{desc}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )
          })}

          {/* Merchant Portal shortcut */}
          <Link
            href="/seller"
            onClick={onClose}
            className="flex items-center justify-between p-4 bg-amber-50/50 hover:bg-amber-50 rounded-2xl border border-dashed border-amber-200 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-100 text-amber-850 rounded-xl flex items-center justify-center">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900">Merchant Portal</h4>
                <p className="text-[10px] text-amber-600">Log in or apply as a seller</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </Drawer>
  )
}
