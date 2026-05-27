'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, ArrowRight, ShieldCheck, Truck, Heart } from 'lucide-react'

export function StoreEditorialHero() {
  // Smooth scroll handler to jump directly down to the store catalog grid
  const scrollToCatalog = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById('catalog-start-anchor')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* 1. Immersive Glassmorphic Parallax Editorial Hero */}
      <div className="relative h-[340px] md:h-[420px] rounded-3xl overflow-hidden shadow-premium border border-slate-100 flex items-center p-6 md:p-12">
        {/* Background Image Panel */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
            alt="Martnex Luxury Store Showcase"
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-[0.78] scale-102"
            unoptimized
          />
          {/* Curated Soft Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/40 to-transparent" />
        </div>

        {/* Floating Glassmorphic Content Card */}
        <div className="relative z-10 max-w-xl bg-white/10 backdrop-blur-lg border border-white/20 p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl text-white space-y-4 md:space-y-6">
          <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.25em] bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-amber-300 animate-pulse" /> Platform Curation
          </span>
          
          <div className="space-y-2 md:space-y-3">
            <h1 className="text-3xl md:text-4xl font-heading font-black tracking-tight leading-[1.1]">
              The Art of Sourcing.<br />
              <span className="text-amber-200">Verified Independent Artisans.</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              We connect conscious buyers directly with ethical manufacturers and boutique creators. Sourced with deep care. Built to endure lifetimes.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <a
              href="#catalog-start-anchor"
              onClick={scrollToCatalog}
              className="bg-white text-slate-900 px-5 md:px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all hover:scale-102 shadow-md flex items-center gap-1.5"
            >
              Browse Catalog <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/seller/onboarding"
              className="bg-white/10 border border-white/20 text-white px-5 md:px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-white/25 transition-all"
            >
              Apply as Seller
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Visual 3-Column Premium Category Showcase Cards */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">
          Explore Curated Departments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Apparel & Outerwear',
              desc: 'Premium sustainable cotton hoodies, structured utility jackets, and minimalist essentials.',
              handle: 'apparel',
              tag: 'New Arrivals',
              image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format&fit=crop',
            },
            {
              name: 'Premium Footwear',
              desc: 'Performance engineered knit activewear shoes and ethically sourced lugged leather boots.',
              handle: 'footwear',
              tag: 'Best Sellers',
              image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=400&auto=format&fit=crop',
            },
            {
              name: 'Lifestyle & Acoustics',
              desc: 'Premium hybrid noise-cancelling headphones and water-resistant leather travel packs.',
              handle: 'lifestyle',
              tag: 'Award Winning',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
            },
          ].map((cat) => (
            <Link
              key={cat.handle}
              href={`/store?category=${cat.handle}`}
              className="group border border-slate-100/80 bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col h-[280px]"
            >
              {/* Category Image Cover */}
              <div className="relative h-[150px] bg-slate-50 overflow-hidden shrink-0">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-104 transition-transform duration-500"
                  unoptimized
                />
                <span className="absolute top-3.5 right-3.5 text-[8px] font-black uppercase tracking-[0.2em] bg-white/95 backdrop-blur-sm text-slate-800 px-2 py-0.5 rounded shadow-sm border border-slate-100">
                  {cat.tag}
                </span>
              </div>

              {/* Category Card Descriptions */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-850 group-hover:text-slate-950 transition-colors">
                    {cat.name}
                  </h4>
                  <p className="text-[10.5px] text-slate-400 leading-normal mt-1 line-clamp-2">
                    {cat.desc}
                  </p>
                </div>
                
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 group-hover:text-slate-900 transition-colors flex items-center gap-1 mt-2">
                  Browse Department <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. Verified Vendor Promise Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-100/80 bg-slate-50/50 rounded-3xl p-6 md:p-8 gap-6 md:gap-8 shadow-sm">
        {[
          {
            icon: ShieldCheck,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
            title: 'Verified Sourcing Policy',
            desc: 'Every vendor is heavily audited to guarantee living-wage factory conditions, ethical manufacturing, and authentic brand materials.'
          },
          {
            icon: Truck,
            color: 'text-amber-600 bg-amber-50 border-amber-100/50',
            title: 'Carbon-Neutral Logistics',
            desc: 'We purchase platform-wide carbon offset tags for all courier delivery methods, keeping local merchant shipments fully carbon-neutral.'
          },
          {
            icon: Heart,
            color: 'text-rose-600 bg-rose-50 border-rose-100/50',
            title: 'Direct Marketplace Economy',
            desc: 'By skipping secondary distribution wholesalers, up to 92% of order revenue goes directly to supporting the artisan makers.'
          }
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <div key={idx} className="flex gap-4 items-start p-1">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h5 className="text-xs font-black text-slate-800">
                  {item.title}
                </h5>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Anchor Element to Scroll Down to */}
      <div id="catalog-start-anchor" className="scroll-mt-4" />
    </div>
  )
}
