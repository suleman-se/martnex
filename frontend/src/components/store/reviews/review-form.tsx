'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldLabel } from '@/components/shared/forms/field-label'
import { useSubmitReview } from '@/hooks/use-reviews'

/**
 * Star picker plus optional title and body.
 *
 * The stars are real radio inputs kept visually hidden with `sr-only` rather
 * than `hidden`, so they stay reachable by keyboard and screen readers.
 */
export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const { mutate, isPending, isSuccess, error } = useSubmitReview(productId)
  const shown = hovered || rating

  if (isSuccess) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/40 p-5">
        <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300" role="status">
          Thanks — your review is published.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (rating > 0) mutate({ rating, title, content })
      }}
      className="rounded-2xl border border-slate-150 dark:border-slate-800 p-5 space-y-4"
    >
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          Your rating
        </legend>
        <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <label
              key={star}
              className="cursor-pointer p-0.5 focus-within:ring-2 focus-within:ring-primary/40 rounded"
              onMouseEnter={() => setHovered(star)}
            >
              <input
                type="radio"
                name="rating"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                className="sr-only"
              />
              <span className="sr-only">{star} star{star === 1 ? '' : 's'}</span>
              <Star
                aria-hidden="true"
                className={`h-7 w-7 transition-colors ${
                  shown >= star ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-slate-300'
                }`}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <FieldLabel htmlFor="review-title">Title (optional)</FieldLabel>
        <Input
          id="review-title"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sums up your experience"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <FieldLabel htmlFor="review-content">Review (optional)</FieldLabel>
        <textarea
          id="review-content"
          value={content}
          maxLength={4000}
          rows={4}
          onChange={(e) => setContent(e.target.value)}
          placeholder="How did it fit, feel, and hold up?"
          disabled={isPending}
          className="flex w-full rounded-lg border border-border bg-input px-5 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition-all disabled:opacity-60"
        />
      </div>

      {error && (
        <p className="text-[11px] font-bold text-destructive" role="alert">
          {error instanceof Error ? error.message : 'Could not submit your review.'}
        </p>
      )}

      <Button
        type="submit"
        variant="premium"
        disabled={isPending || rating === 0}
        className="h-12 w-full font-black uppercase tracking-widest text-[11px]"
      >
        {isPending ? 'Publishing…' : 'Publish Review'}
      </Button>
    </form>
  )
}
