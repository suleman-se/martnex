'use client'

import React from 'react'

interface ProductCardDetailsProps {
  title: string
  description?: string | null
  priceFormatted: string
  variantsCount: number
}

export function ProductCardDetails({
  title,
  description,
  priceFormatted,
  variantsCount,
}: ProductCardDetailsProps) {
  return (
    <div className="p-3.5 md:p-5 flex flex-col gap-1 md:gap-2 flex-1">
      <h3 className="font-bold text-slate-900 text-xs md:text-sm leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors">
        {title}
      </h3>
      {description && (
        <p className="text-[10px] md:text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}
      <div className="mt-auto pt-2 md:pt-3 flex items-center justify-between">
        <span className="text-sm md:text-base font-black text-slate-900">
          {priceFormatted}
        </span>
        <span className="text-[9px] md:text-[10px] font-bold text-slate-450 uppercase tracking-widest">
          {variantsCount} var{variantsCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
