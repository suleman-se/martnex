'use client'

import type { RatingSummary as Summary } from '@/lib/api'
import { StarRating } from './star-rating'

/**
 * Average, total and per-star breakdown. Bars are scaled against the busiest
 * star so the shape of the distribution stays readable at low review counts.
 */
export function RatingSummaryPanel({ summary }: { summary: Summary }) {
  const { average, count, distribution } = summary
  const peak = Math.max(1, ...Object.values(distribution ?? {}))

  return (
    <div className="flex flex-col sm:flex-row gap-8 sm:items-center">
      <div className="shrink-0 space-y-1">
        <div className="text-4xl font-black leading-none text-slate-900 dark:text-slate-100 tabular-nums">
          {average?.toFixed(1) ?? '—'}
        </div>
        <StarRating value={average ?? 0} size="md" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {count} {count === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      <ul className="flex-1 space-y-1.5 min-w-0">
        {[5, 4, 3, 2, 1].map((star) => {
          const n = distribution?.[String(star)] ?? 0
          return (
            <li key={star} className="flex items-center gap-3 text-xs">
              <span className="w-8 shrink-0 font-bold text-slate-400 tabular-nums">{star}★</span>
              <span className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <span
                  className="block h-full rounded-full bg-amber-400"
                  style={{ width: `${(n / peak) * 100}%` }}
                />
              </span>
              <span className="w-6 shrink-0 text-right font-bold text-slate-400 tabular-nums">{n}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
