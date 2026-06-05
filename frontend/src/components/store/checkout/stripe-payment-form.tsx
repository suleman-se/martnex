'use client'

import React from 'react'
import { CardElement } from '@stripe/react-stripe-js'

interface StripePaymentFormProps {
  isCardFocused: boolean
  setIsCardFocused: (focused: boolean) => void
}

export function StripePaymentForm({
  isCardFocused,
  setIsCardFocused,
}: StripePaymentFormProps) {
  return (
    <div
      className={`px-5 py-4 bg-white border border-slate-100 rounded-2xl transition-all duration-300 space-y-2.5 ${
        isCardFocused
          ? 'border-slate-900 ring-2 ring-slate-900/5 shadow-sm'
          : 'shadow-sm'
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Card Details
      </p>
      <CardElement
        onFocus={() => setIsCardFocused(true)}
        onBlur={() => setIsCardFocused(false)}
        options={{
          style: {
            base: {
              fontSize: '14px',
              color: typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '#f8fafc' : '#1e293b',
              '::placeholder': { color: '#94a3b8' },
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            invalid: {
              color: '#ba1a1a',
            },
          },
        }}
      />
    </div>
  )
}
