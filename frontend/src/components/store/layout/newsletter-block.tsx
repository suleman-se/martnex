'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { subscribeToNewsletter } from '@/lib/api'

export function NewsletterBlock() {
  const [email, setEmail] = useState('')

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: () => setEmail(''),
  })

  return (
    <div className="space-y-4">
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Stay Updated</h4>
      <p className="text-xs text-slate-400 leading-relaxed">
        Subscribe to unlock early catalog access and premium merchant deals.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (email.trim()) mutate(email.trim())
        }}
        className="relative flex items-center border border-slate-200 focus-within:border-slate-400 bg-white rounded-xl p-1 transition-all duration-200"
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          placeholder="your@email.com"
          className="w-full bg-transparent px-3 py-1.5 text-xs text-slate-800 focus:outline-none placeholder:text-slate-300 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-slate-900 text-white px-4 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-60 cursor-pointer"
        >
          {isPending ? 'Joining…' : 'Join'}
        </button>
      </form>

      {isSuccess && (
        <p className="text-[11px] font-bold text-emerald-600" role="status">
          You&apos;re on the list. Watch your inbox for early catalog access.
        </p>
      )}
      {error && (
        <p className="text-[11px] font-bold text-red-600" role="alert">
          {error instanceof Error ? error.message : 'Could not subscribe right now.'}
        </p>
      )}
    </div>
  )
}
