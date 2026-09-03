'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProductReviews, submitProductReview } from '@/lib/api'

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchProductReviews(productId as string),
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
  })
}

export function useSubmitReview(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { rating: number; title?: string; content?: string }) => {
      const token = localStorage.getItem('access_token') ?? undefined
      return submitProductReview({ productId, ...input }, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
    },
  })
}
