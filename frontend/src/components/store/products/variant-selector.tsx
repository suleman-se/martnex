'use client'

import { useState } from 'react'
import type { StoreProduct, ProductVariant } from '@/hooks/use-products'
import { Eyebrow } from '@/components/shared/typography/eyebrow'

interface VariantSelectorProps {
  product: StoreProduct
  onVariantChange: (variant: ProductVariant | null) => void
}

export function VariantSelector({ product, onVariantChange }: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Default to first value of each option
    const defaults: Record<string, string> = {}
    product.options.forEach((opt) => {
      if (opt.values[0]) defaults[opt.id] = opt.values[0].value
    })
    return defaults
  })

  function handleOptionChange(optionId: string, value: string) {
    const next = { ...selectedOptions, [optionId]: value }
    setSelectedOptions(next)

    // Find matching variant
    const match = product.variants.find((v) =>
      v.options.every((o) => {
        const optId = o.option_id ?? ''
        return next[optId] === o.value
      })
    )
    onVariantChange(match ?? null)
  }

  if (!product.options.length || product.variants.length <= 1) return null

  return (
    <div className="space-y-4">
      {product.options.map((option) => (
        <div key={option.id}>
          <Eyebrow className="mb-2">
            {option.title}
          </Eyebrow>
          <div className="flex flex-wrap gap-2">
            {option.values.map((v) => {
              const isSelected = selectedOptions[option.id] === v.value
              return (
                <button
                  key={v.value}
                  onClick={() => handleOptionChange(option.id, v.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >
                  {v.value}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
