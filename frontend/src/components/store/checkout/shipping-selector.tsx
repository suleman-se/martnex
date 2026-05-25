'use client'

import { useQuery } from '@tanstack/react-query'
import { useCheckout, type ShippingOption } from '@/hooks/use-checkout'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/api'
import { useState } from 'react'
import { Loader2, Truck, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ShippingSelectorProps {
  cartId: string
  onComplete: () => void
  onBack: () => void
}

export function ShippingSelector({ cartId, onComplete, onBack }: ShippingSelectorProps) {
  const { getShippingOptions, setShippingMethod } = useCheckout()
  const { cart } = useCart()
  const currencyCode = cart?.currency_code || 'usd'

  const { data: options, isLoading, error } = useQuery({
    queryKey: ['shipping-options', cartId],
    queryFn: () => getShippingOptions(cartId),
    enabled: !!cartId,
  })

  // Track currently active shipping method in the cart (if any)
  const currentOptionId = cart?.shipping_methods?.[0]?.id || ''
  const [selectedId, setSelectedId] = useState<string>(currentOptionId)

  // Map mock transit times for premium feel
  function getTransitTime(name: string): string {
    const lower = name.toLowerCase()
    if (lower.includes('express') || lower.includes('priority') || lower.includes('fast')) {
      return '1 - 2 business days (Express)'
    }
    if (lower.includes('overnight') || lower.includes('next day')) {
      return 'Next business day (Overnight)'
    }
    return '3 - 5 business days (Standard)'
  }

  async function handleSelection(optionId: string) {
    setSelectedId(optionId)
    try {
      await setShippingMethod.mutateAsync({ cartId, optionId })
      toast.success('Delivery method applied')
    } catch {
      toast.error('Failed to set delivery method')
    }
  }

  async function handleSubmit() {
    if (!selectedId) {
      toast.warning('Please select a shipping method')
      return
    }
    onComplete()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
        <p className="text-xs font-semibold">Fetching shipping options...</p>
      </div>
    )
  }

  if (error || !options || options.length === 0) {
    return (
      <div className="py-8 text-center space-y-4">
        <p className="text-sm font-medium text-slate-500 font-bold">
          No shipping options are currently configured for your country.
        </p>
        <Button onClick={onBack} variant="outline" className="rounded-xl text-xs font-bold">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 animate-in fade-in duration-500">
        {options.map((option) => {
          const isSelected = selectedId === option.id
          const transitTime = getTransitTime(option.name)

          return (
            <button
              key={option.id}
              onClick={() => handleSelection(option.id)}
              disabled={setShippingMethod.isPending}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'border-slate-900 bg-slate-50/50 shadow-sm'
                  : 'border-slate-100 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{option.name}</h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{transitTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900">
                  {option.amount === 0 ? 'Free' : formatPrice(option.amount, currencyCode)}
                </span>
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <Button
          onClick={onBack}
          variant="ghost"
          className="h-10 px-4 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          ← Edit Address
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!selectedId || setShippingMethod.isPending}
          className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-sm"
        >
          {setShippingMethod.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Continue to Payment →'
          )}
        </Button>
      </div>
    </div>
  )
}
