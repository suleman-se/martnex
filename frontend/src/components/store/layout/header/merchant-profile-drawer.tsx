'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Drawer } from '@/components/shared/drawer'
import { ShieldCheck, MapPin, Mail, Leaf, Calendar, Star, Sparkles } from 'lucide-react'

interface MerchantProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function MerchantProfileDrawer({ isOpen, onClose }: MerchantProfileDrawerProps) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      title="Merchant Profile"
      className="max-w-md w-full"
    >
      <div className="p-6 space-y-8">
        {/* 1. Merchant Brand Identity Header */}
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl border border-slate-100 shadow-premium shrink-0 dark:bg-slate-100 dark:text-slate-900">
            M
          </div>
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-slate-950 truncate">
                Martnex Premium Goods
              </h3>
              <ShieldCheck strokeWidth={2.5} className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
            
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 border border-emerald-200/80 px-2 py-0.5 rounded inline-block dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30">
              Verified Platform Artisan
            </p>

            <div className="space-y-1 pt-1.5 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>Portland, Oregon, USA</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">seller@martnex.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Sustainability & Vendor Ratings */}
        <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-6">
          <div className="space-y-1 p-3 bg-slate-50 border border-slate-100/50 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Leaf className="h-3.5 w-3.5 text-emerald-500" /> Carbon Offset
            </span>
            <div>
              <span className="text-xl font-black text-slate-900 leading-none">98%</span>
              <p className="text-[9px] font-bold text-slate-450 mt-0.5">Eco-Sourced Rating</p>
            </div>
          </div>

          <div className="space-y-1 p-3 bg-slate-50 border border-slate-100/50 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400" /> Seller Rating
            </span>
            <div>
              <span className="text-xl font-black text-slate-900 leading-none">4.9 / 5</span>
              <p className="text-[9px] font-bold text-slate-450 mt-0.5">From 300+ buyers</p>
            </div>
          </div>
        </div>

        {/* 3. Artisan Brand Story */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Artisan Story & Sourcing
          </h4>
          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
            Martnex Premium Goods crafts premium streetwear utility garments, rugged commuter leather boots, and sustainable desk audio acoustics in micro-studio environments. All raw materials are certified organic and sourced directly from family-run mills.
          </p>
        </div>

        {/* 4. Curated Mini-Catalog Preview */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            <span>Featured Seller Goods</span>
          </div>

          <div className="space-y-3">
            {[
              {
                title: 'Urban Oversized Hoodie',
                price: '$89.00',
                handle: 'oversized-hoodie',
                image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=150'
              },
              {
                title: 'Lugged Leather Boots',
                price: '$189.00',
                handle: 'lugged-leather-boots',
                image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=150'
              },
              {
                title: 'Acoustic Active ANC Headphones',
                price: '$249.00',
                handle: 'acoustic-active-anc-headphones',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=150'
              }
            ].map((prod) => (
              <Link
                key={prod.handle}
                href={`/store/products/${prod.handle}`}
                onClick={onClose}
                className="flex items-center gap-3.5 p-2 rounded-2xl border border-slate-100 hover:border-slate-250 bg-white hover:bg-slate-50/20 transition-all group/row"
              >
                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-sm">
                  <Image
                    src={prod.image}
                    alt={prod.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-black text-slate-800 truncate group-hover/row:text-slate-950 transition-colors">
                    {prod.title}
                  </h5>
                  <p className="text-xs font-black text-slate-900 mt-0.5">
                    {prod.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Link to Full Storefront */}
          <div className="pt-2">
            <Link
              href="/store/merchants/01KQ9V6DK0NQDY3VKD9STRSS8F"
              onClick={onClose}
              className="flex items-center justify-center w-full py-3.5 px-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors gap-2 cursor-pointer shadow-sm select-none"
            >
              <span>View Complete Storefront</span>
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
            </Link>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
