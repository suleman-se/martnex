'use client'

import React from 'react'

/** Standard subtle shimmering background styling class */
const SHIMMER_CLASS = 'animate-pulse bg-slate-100 rounded-xl shrink-0'

interface SkeletonCardProps {
  className?: string
}

/** Shimmering skeleton mirroring a premium product catalog card */
export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`border border-slate-100/80 rounded-3xl p-3.5 bg-white space-y-4 flex flex-col justify-between shadow-sm animate-in fade-in duration-300 ${className}`}>
      <div className="space-y-3 flex-1">
        {/* Shimmer Image */}
        <div className={`aspect-square w-full ${SHIMMER_CLASS}`} />
        
        {/* Shimmer Title */}
        <div className={`h-4.5 w-3/4 ${SHIMMER_CLASS}`} />
        
        {/* Shimmer Option Swatches Grid */}
        <div className="flex gap-1.5 overflow-hidden py-1">
          <div className={`h-6.5 w-11 ${SHIMMER_CLASS} rounded-full`} />
          <div className={`h-6.5 w-14 ${SHIMMER_CLASS} rounded-full`} />
          <div className={`h-6.5 w-12 ${SHIMMER_CLASS} rounded-full`} />
        </div>
      </div>
      
      {/* Shimmer Footer: Price & Quick Add Button */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className={`h-5 w-16 ${SHIMMER_CLASS}`} />
        <div className={`h-8.5 w-8.5 ${SHIMMER_CLASS} rounded-full`} />
      </div>
    </div>
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-in fade-in duration-300">
      {/* Left Column: Gallery Carousel Skeletons (7/12 cols) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Primary Large Image */}
        <div className={`aspect-square w-full md:h-[520px] ${SHIMMER_CLASS} rounded-3xl shadow-sm`} />
        
        {/* Thumbnails Row */}
        <div className="flex gap-3 overflow-x-auto py-1">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className={`h-20 w-20 ${SHIMMER_CLASS} rounded-2xl shadow-sm`} />
          ))}
        </div>
      </div>

      {/* Right Column: Descriptions, Variants, Actions Skeletons (5/12 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Title & Description Shimmers */}
        <div className="space-y-3">
          <div className={`h-8.5 w-2/3 ${SHIMMER_CLASS}`} />
          <div className="space-y-2 pt-2">
            <div className={`h-3.5 w-full ${SHIMMER_CLASS}`} />
            <div className={`h-3.5 w-11/12 ${SHIMMER_CLASS}`} />
            <div className={`h-3.5 w-4/5 ${SHIMMER_CLASS}`} />
          </div>
        </div>

        {/* Pricing Shimmer */}
        <div className="py-2 border-y border-slate-100 flex items-center gap-3">
          <div className={`h-8 w-24 ${SHIMMER_CLASS}`} />
          <div className={`h-4.5 w-20 ${SHIMMER_CLASS}`} />
        </div>

        {/* Option Selection Groups */}
        <div className="space-y-4 pt-2">
          {/* Size Label & Buttons */}
          <div className="space-y-2.5">
            <div className={`h-3.5 w-12 ${SHIMMER_CLASS}`} />
            <div className="flex gap-2.5">
              <div className={`h-10 w-12 ${SHIMMER_CLASS}`} />
              <div className={`h-10 w-12 ${SHIMMER_CLASS}`} />
              <div className={`h-10 w-12 ${SHIMMER_CLASS}`} />
              <div className={`h-10 w-12 ${SHIMMER_CLASS}`} />
            </div>
          </div>

          {/* Color Label & Buttons */}
          <div className="space-y-2.5 pt-1">
            <div className={`h-3.5 w-14 ${SHIMMER_CLASS}`} />
            <div className="flex gap-2.5">
              <div className={`h-10 w-20 ${SHIMMER_CLASS} rounded-full`} />
              <div className={`h-10 w-20 ${SHIMMER_CLASS} rounded-full`} />
            </div>
          </div>
        </div>

        {/* Add to Cart CTA Shimmer */}
        <div className="pt-4">
          <div className={`h-13 w-full ${SHIMMER_CLASS} rounded-2xl shadow-sm`} />
        </div>

        {/* Trust Badges Shimmer Grid */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <div className={`h-12 w-full ${SHIMMER_CLASS}`} />
          <div className={`h-12 w-full ${SHIMMER_CLASS}`} />
          <div className={`h-12 w-full ${SHIMMER_CLASS}`} />
        </div>

        {/* Accordions Info Shimmers */}
        <div className="space-y-3 pt-6">
          <div className={`h-12 w-full ${SHIMMER_CLASS}`} />
          <div className={`h-12 w-full ${SHIMMER_CLASS}`} />
        </div>
      </div>
    </div>
  )
}
