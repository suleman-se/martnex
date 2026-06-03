'use client'

import React from 'react'

/** Standard subtle shimmering background styling class */
const SHIMMER_CLASS = 'animate-pulse bg-slate-100 rounded-xl shrink-0'

import { ProductCard } from '@/components/store/products/product-card'
import { StoreProduct } from '@/lib/api'

// TODO: Replace with real api-backed skeleton frames
const MOCK_PRODUCT: StoreProduct = {
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
    <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 ${className}`}>
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

/** Shimmering skeleton mirroring the Account Dashboard & portal state */
export function SkeletonAccount() {
  return (
    <Skeletonify className="space-y-8 animate-in fade-in duration-300">
      {/* Header and Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-100 rounded-xl" />
          <div className="h-4 w-96 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-100 rounded-2xl shrink-0" />
      </div>

      {/* 3-Column Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-24 bg-white rounded-3xl border border-slate-100 p-6 flex items-center gap-5 shadow-sm">
            <div className="h-12 w-12 bg-slate-100 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-slate-100 rounded-md" />
              <div className="h-6 w-32 bg-slate-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Row Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Left Column: Recent Purchases Skeletons */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4.5 w-40 bg-slate-100 rounded-md" />
            <div className="h-4.5 w-16 bg-slate-100 rounded-md" />
          </div>

          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-20 bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="h-11 w-11 bg-slate-100 rounded-xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-36 bg-slate-100 rounded-md" />
                    <div className="h-3.5 w-24 bg-slate-100 rounded-md" />
                  </div>
                </div>
                <div className="h-10 w-24 bg-slate-100 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Settings Skeletons */}
        <div className="xl:col-span-2 space-y-4">
          <div className="h-4.5 w-36 bg-slate-100 rounded-md" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-18 bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="h-10 w-10 bg-slate-100 rounded-xl shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-24 bg-slate-100 rounded-md" />
                    <div className="h-3 w-40 bg-slate-100 rounded-md" />
                  </div>
                </div>
                <div className="h-4 w-4 bg-slate-100 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Skeletonify>
  )
}

/** Shimmering skeleton mirroring a saved shipping/billing address card */
export function SkeletonAddressCard() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm relative flex flex-col justify-between min-h-[210px] animate-pulse">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-slate-100 rounded-md" />
            <div className="h-4 w-28 bg-slate-100 rounded-md" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-4.5 w-14 bg-slate-100 rounded-full" />
            <div className="h-4.5 w-14 bg-slate-100 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
          <div className="h-3.5 w-1/2 bg-slate-100 rounded-md" />
          <div className="h-3 w-2/3 bg-slate-100 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
        <div className="h-8 w-16 bg-slate-100 rounded-lg" />
        <div className="h-8 w-16 bg-slate-100 rounded-lg" />
      </div>
    </div>
  )
}

/** Responsive grid displaying multiple shipping address card skeletons */
export function SkeletonAddresses() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: 2 }).map((_, idx) => (
        <SkeletonAddressCard key={idx} />
      ))}
    </div>
  )
}

/** Shimmering skeleton mirroring a detailed purchase history order card */
export function SkeletonOrderCard() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 lg:p-6 shadow-sm flex flex-col gap-5 animate-pulse">
      {/* Order Top Bar: Date, ID, Status, Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-7 w-16 bg-slate-100 rounded-xl" />
          <div className="h-4 w-28 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3.5">
          <div className="h-6 w-20 bg-slate-100 rounded-full" />
          <div className="h-5 w-16 bg-slate-100 rounded-md" />
        </div>
      </div>

      {/* Order Items & Action Button Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 w-full bg-slate-50/50 border border-slate-100/50 rounded-2xl p-2 max-w-[200px] shrink-0">
              <div className="h-10 w-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-20 bg-slate-100 rounded-md" />
                <div className="h-3 w-10 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full bg-slate-50/50 border border-slate-100/50 rounded-2xl p-2 max-w-[200px] shrink-0">
              <div className="h-10 w-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 w-20 bg-slate-100 rounded-md" />
                <div className="h-3 w-10 bg-slate-100 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        <div className="h-11 w-28 bg-slate-100 rounded-2xl shrink-0 self-end lg:self-center" />
      </div>
    </div>
  )
}

/** Lists multiple order card loading skeletons */
export function SkeletonOrders() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <SkeletonOrderCard key={idx} />
      ))}
    </div>
  )
}

/** Shimmering skeleton mirroring the profile setting forms */
export function SkeletonProfile() {
  return (
    <div className="space-y-6 max-w-2xl animate-pulse">
      {/* Main Form Card */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="h-4.5 w-4.5 bg-slate-100 rounded-md" />
          <div className="h-4 w-32 bg-slate-100 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-11 w-full bg-slate-100 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-16 bg-slate-100 rounded" />
            <div className="h-11 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-slate-100 rounded" />
            <div className="h-11 w-full bg-slate-100 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-slate-100 rounded" />
            <div className="h-11 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="pt-2">
          <div className="h-11 w-44 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {/* Security Card */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-4">
          <div className="h-4.5 w-4.5 bg-slate-100 rounded-md" />
          <div className="h-4 w-36 bg-slate-100 rounded-md" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-slate-100 rounded-md" />
          <div className="h-3.5 w-5/6 bg-slate-100 rounded-md" />
        </div>
        <div className="h-10 w-44 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  )
}

/** Shimmering skeleton mirroring the checkout page saved address selector */
export function SkeletonSavedAddresses() {
  return (
    <div className="mb-8 animate-pulse">
      <div className="h-3.5 w-36 bg-slate-100 rounded-md mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-slate-100 bg-white min-h-[120px] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-slate-100 rounded-md" />
              <div className="h-3 w-40 bg-slate-100 rounded-md" />
              <div className="h-2.5 w-28 bg-slate-100 rounded-md" />
            </div>
            <div className="h-3 w-16 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

