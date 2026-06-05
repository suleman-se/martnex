'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, ArrowRight } from 'lucide-react'

interface CategoryMegaMenuProps {
  activeMenu: string
  onMouseEnter: (menu: string) => void
  onMouseLeave: () => void
  onNavigate: () => void
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

export function CategoryMegaMenu({
  activeMenu,
  onMouseEnter,
  onMouseLeave,
  onNavigate
}: CategoryMegaMenuProps) {
  const fp = getFeaturedProduct(activeMenu)

  return (
    <div
      className="absolute top-16 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-premium animate-in fade-in slide-in-from-top-2 duration-200 z-40 py-8 px-6"
      onMouseEnter={() => onMouseEnter(activeMenu)}
      onMouseLeave={onMouseLeave}
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
                      onClick={onNavigate}
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
                      onClick={onNavigate}
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
            onClick={onNavigate}
            className="text-xs font-black text-slate-900 hover:underline flex items-center gap-1 mt-4 group"
          >
            View All {activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Featured Product Card (Column 4) */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col group/card">
          <Link
            href={fp.url}
            onClick={onNavigate}
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
        </div>
      </div>
    </div>
  )
}
