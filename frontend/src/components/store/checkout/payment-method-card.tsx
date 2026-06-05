'use client'

import React from 'react'
import { CheckCircle2 } from 'lucide-react'

interface PaymentMethodCardProps {
  label: string
  description: string
  icon: React.ReactNode
  selected: boolean
  disabled: boolean
  onClick: () => void
}

export function PaymentMethodCard({
  label,
  description,
  icon,
  selected,
  disabled,
  onClick,
}: PaymentMethodCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-150 ${
        selected
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-350'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`shrink-0 ${selected ? 'text-white' : 'text-slate-400'}`}>
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold">{label}</span>
        <span className={`text-xs ${selected ? 'text-slate-300' : 'text-slate-400'}`}>
          {description}
        </span>
      </span>
      {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />}
    </button>
  )
}
