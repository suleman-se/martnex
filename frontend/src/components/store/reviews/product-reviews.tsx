'use client'

import Link from 'next/link'
import { BadgeCheck } from 'lucide-react'
import { useProductReviews } from '@/hooks/use-reviews'
import { useAuthStore } from '@/lib/store/auth-store'
import { useMounted } from '@/hooks/use-mounted'
import { StarRating } from './star-rating'
import { RatingSummaryPanel } from './rating-summary'
import { ReviewForm } from './review-form'

export function ProductReviews({ productId }: { productId: string }) {
  const mounted = useMounted()
  const { data, isLoading } = useProductReviews(productId)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const reviews = data?.reviews ?? []
  const summary = data?.summary

  return (
    <section className="space-y-6 pt-4" aria-labelledby="reviews-heading">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2
          id="reviews-heading"
          className="text-lg font-heading font-black uppercase tracking-tight text-slate-900 dark:text-slate-100"
        >
          Customer Reviews
        </h2>
        {summary && summary.count > 0 && (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {summary.count} {summary.count === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>

      {isLoading && <div className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />}

      {!isLoading && summary && summary.count > 0 && <RatingSummaryPanel summary={summary} />}

      {!isLoading && reviews.length === 0 && (
        <p className="text-sm font-semibold text-slate-400">
          No reviews yet. Be the first to review this product.
        </p>
      )}

      {reviews.length > 0 && (
        <ul className="space-y-5">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="border-b border-slate-100 dark:border-slate-800 pb-5 last:border-0 space-y-2"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <StarRating value={review.rating} />
                <span className="text-xs font-black text-slate-900 dark:text-slate-100">
                  {review.customer_name || 'Verified buyer'}
                </span>
                {review.is_verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified purchase
                  </span>
                )}
                <time
                  dateTime={review.created_at}
                  className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-auto"
                >
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </time>
              </div>
              {review.title && (
                <p className="text-sm font-black text-slate-900 dark:text-slate-100">{review.title}</p>
              )}
              {review.content && (
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{review.content}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Rendered after mount so the signed-in branch cannot mismatch on hydration. */}
      {mounted &&
        (isAuthenticated ? (
          <ReviewForm productId={productId} />
        ) : (
          <p className="text-sm font-semibold text-slate-400">
            <Link href="/login" className="underline hover:text-slate-900 dark:hover:text-slate-100">
              Sign in
            </Link>{' '}
            to leave a review.
          </p>
        ))}
    </section>
  )
}
