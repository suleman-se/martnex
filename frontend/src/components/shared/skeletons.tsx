'use client'

import React from 'react'

/** Standard subtle shimmering background styling class */
const SHIMMER_CLASS = 'animate-pulse bg-slate-100 rounded-xl shrink-0'

import { ProductCard } from '@/components/store/products/product-card'

const MOCK_PRODUCT: any = {
  id: 'mock-id',
  title: 'Loading Premium Item',
  handle: 'mock-handle',
  thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=150',
  description: 'Placeholder description for loading shimmers',
  variants: [
    {
      id: 'var-1',
      title: 'Default',
      prices: [{ id: 'p-1', amount: 89.00, currency_code: 'usd' }],
      options: []
    }
  ],
  options: [
    {
      id: 'opt-1',
      title: 'Size',
      values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }]
    }
  ],
  images: []
}

interface SkeletonCardProps {
  className?: string
}

/** Shimmering skeleton mirroring a premium product catalog card */
export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <Skeletonify className={className}>
      <ProductCard product={MOCK_PRODUCT} />
    </Skeletonify>
  )
}

interface SkeletonGridProps {
  count?: number
  className?: string
}

/** Responsive grid displaying multiple shimmering SkeletonCards */
export function SkeletonGrid({ count = 8, className = '' }: SkeletonGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  )
}

/** Shimmering skeleton mirroring a detailed product description client layout */
export function SkeletonDetail() {
  return (
    <Skeletonify className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 animate-in fade-in duration-300">
      {/* Back button link shape */}
      <div className="h-4.5 w-32 bg-slate-100 rounded-md mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Gallery Carousel Skeletons */}
        <div className="space-y-4">
          {/* Primary Large Image */}
          <div className="aspect-square w-full md:h-[520px] bg-slate-100 rounded-3xl" />
          
          {/* Thumbnails Row */}
          <div className="flex gap-3 overflow-x-auto py-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-16 w-16 shrink-0 bg-slate-100 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Right Column: Descriptions, Variants, Actions Skeletons */}
        <div className="flex flex-col gap-6 py-2">
          {/* Title & Badge */}
          <div className="space-y-3">
            <h1 className="h-9 w-2/3 bg-slate-100 rounded-xl" />
            <div className="flex items-center gap-3">
              <span className="h-4 w-32 bg-slate-100 rounded-md" />
              <span className="h-4 w-4 bg-slate-100 rounded-full" />
              <span className="h-4.5 w-44 bg-slate-100 rounded-md" />
            </div>
          </div>

          {/* Price Shimmer */}
          <div className="h-8 w-24 bg-slate-100 rounded-lg my-2" />

          {/* Description Shimmer */}
          <div className="space-y-2">
            <p className="h-3.5 w-full bg-slate-100 rounded-md" />
            <p className="h-3.5 w-11/12 bg-slate-100 rounded-md" />
            <p className="h-3.5 w-4/5 bg-slate-100 rounded-md" />
          </div>

          {/* Variant Selector Shimmer */}
          <div className="space-y-3.5 mt-2">
            <div className="h-3.5 w-14 bg-slate-100 rounded-md" />
            <div className="flex gap-2">
              <div className="h-9 w-14 bg-slate-100 rounded-full" />
              <div className="h-9 w-14 bg-slate-100 rounded-full" />
              <div className="h-9 w-14 bg-slate-100 rounded-full" />
            </div>
          </div>

          {/* Quantity selector row */}
          <div className="flex items-center gap-3 mt-1">
            <span className="h-3.5 w-8 bg-slate-100 rounded-md" />
            <div className="h-9 w-24 bg-slate-100 rounded-xl" />
          </div>

          {/* Add to Cart CTA Shimmer */}
          <div className="h-14 w-full bg-slate-100 rounded-2xl shadow-sm" />

          {/* Trust Badges Shimmer Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 mt-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50/50">
                <div className="h-7 w-7 bg-slate-100 rounded-lg mb-1.5 shrink-0" />
                <span className="h-3 w-16 bg-slate-100 rounded-sm mb-1" />
                <span className="h-2 w-12 bg-slate-100 rounded-sm" />
              </div>
            ))}
          </div>

          {/* Accordions Info Shimmers */}
          <div className="border-t border-slate-100 pt-6 mt-2 space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-13 w-full bg-slate-50/30 rounded-2xl border border-slate-100/50" />
            ))}
          </div>

          {/* Verified Merchant Section Card Shimmer */}
          <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-100 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-slate-100 rounded-md" />
                <div className="h-3 w-24 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="h-3.5 w-16 bg-slate-100 rounded-md" />
          </div>
        </div>
      </div>
    </Skeletonify>
  )
}

interface SkeletonifyProps {
  children: React.ReactNode
  active?: boolean
  className?: string
}

/**
 * Reusable layout skeleton generator.
 * Wraps any React element/component tree and automatically paints
 * all text, image, and icon tags into shimmering placeholders,
 * perfectly mirroring the actual component's size and alignment.
 */
export function Skeletonify({ children, active = true, className = '' }: SkeletonifyProps) {
  if (!active) return <>{children}</>
  return (
    <div className={`skeleton-auto w-full h-full select-none pointer-events-none ${className}`}>
      {children}
    </div>
  )
}
