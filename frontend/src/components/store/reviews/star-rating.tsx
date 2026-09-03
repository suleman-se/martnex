'use client'

import { Star } from 'lucide-react'

interface StarRatingProps {
  /** 0-5; fractional values fill the nearest half star. */
  value: number
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Read-only star display. Announces the numeric value to assistive tech rather
 * than leaving screen readers to count icons.
 */
export function StarRating({ value, size = 'sm', className = '' }: StarRatingProps) {
  const dimension = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5'

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star - 0.5
        return (
          <Star
            key={star}
            aria-hidden="true"
            className={`${dimension} ${
              filled ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300'
            }`}
          />
        )
      })}
    </span>
  )
}
