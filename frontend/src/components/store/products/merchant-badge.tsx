'use client'

import React from 'react'
import { ShieldCheck } from 'lucide-react'

interface MerchantBadgeProps {
  onOpenDrawer: () => void
}

export function MerchantBadge({ onOpenDrawer }: MerchantBadgeProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onOpenDrawer()
      }}
      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-650 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100/50 px-2 py-0.5 rounded transition-all cursor-pointer select-none dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/30 dark:hover:bg-emerald-950/60"
      title="Click to view verified seller profile"
    >
      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>Martnex Premium Goods</span>
    </button>
  )
}
