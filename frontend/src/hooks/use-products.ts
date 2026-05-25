'use client'

import { useQuery } from '@tanstack/react-query'
import {
  fetchProducts,
  fetchProductByHandle,
  getDisplayPrice,
  formatPrice
} from '@/lib/api'
import type {
  ProductVariantPrice,
  ProductVariant,
  ProductImage,
  ProductOption,
  StoreProduct,
  FetchProductsParams
} from '@/lib/api'

export type {
  ProductVariantPrice,
  ProductVariant,
  ProductImage,
  ProductOption,
  StoreProduct,
  FetchProductsParams
}

export {
  fetchProducts,
  fetchProductByHandle,
  getDisplayPrice,
  formatPrice
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useProducts(params: FetchProductsParams = {}) {
  return useQuery({
    queryKey: ['store-products', params],
    queryFn: () => fetchProducts(params),
    staleTime: 60_000,
  })
}

export function useProduct(handle: string) {
  return useQuery({
    queryKey: ['store-product', handle],
    queryFn: () => fetchProductByHandle(handle),
    staleTime: 60_000,
    enabled: Boolean(handle),
  })
}

