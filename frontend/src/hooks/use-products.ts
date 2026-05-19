'use client'

import { useQuery } from '@tanstack/react-query'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductVariantPrice {
  id: string
  amount: number
  currency_code: string
}

export interface ProductVariant {
  id: string
  title: string
  prices: ProductVariantPrice[]
  options: { value: string; option_id?: string }[]
  inventory_quantity?: number
}

export interface ProductImage {
  id: string
  url: string
}

export interface ProductOption {
  id: string
  title: string
  values: { value: string }[]
}

export interface StoreProduct {
  id: string
  title: string
  handle: string
  description?: string
  thumbnail?: string
  images: ProductImage[]
  variants: ProductVariant[]
  options: ProductOption[]
  collection?: { id: string; title: string }
  categories?: { id: string; name: string; handle: string }[]
}

export interface FetchProductsParams {
  q?: string
  category_id?: string[]
  collection_id?: string[]
  limit?: number
  offset?: number
}

// ─── API ─────────────────────────────────────────────────────────────────────

const PRODUCT_FIELDS =
  'id,title,handle,thumbnail,description,images.id,images.url,' +
  'variants.id,variants.title,variants.prices.amount,variants.prices.currency_code,' +
  'variants.options.value,variants.options.option_id,' +
  'options.id,options.title,options.values.value,' +
  'categories.id,categories.name,categories.handle,' +
  'collection.id,collection.title'

async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<{ products: StoreProduct[]; count: number }> {
  const headers = await buildStoreHeaders()
  const qs = new URLSearchParams()
  qs.set('fields', PRODUCT_FIELDS)
  if (params.q) qs.set('q', params.q)
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.offset) qs.set('offset', String(params.offset))
  if (params.category_id?.length) {
    params.category_id.forEach((id) => qs.append('category_id[]', id))
  }
  if (params.collection_id?.length) {
    params.collection_id.forEach((id) => qs.append('collection_id[]', id))
  }

  const res = await fetch(`${getBackendUrl()}/store/products?${qs}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch products')
  const data = (await res.json()) as { products: StoreProduct[]; count: number }
  return { products: data.products ?? [], count: data.count ?? 0 }
}

async function fetchProductByHandle(handle: string): Promise<StoreProduct | null> {
  const headers = await buildStoreHeaders()
  const qs = new URLSearchParams()
  qs.set('handle', handle)
  qs.set('fields', PRODUCT_FIELDS)

  const res = await fetch(`${getBackendUrl()}/store/products?${qs}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch product')
  const data = (await res.json()) as { products: StoreProduct[] }
  return data.products?.[0] ?? null
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the lowest price across all variants, in the given currency (defaults to first price). */
export function getDisplayPrice(product: StoreProduct, currencyCode = 'usd'): number | null {
  const prices = product.variants
    .flatMap((v) => v.prices)
    .filter((p) => p.currency_code.toLowerCase() === currencyCode.toLowerCase())
  if (!prices.length) {
    // fallback: first price on first variant
    return product.variants[0]?.prices[0]?.amount ?? null
  }
  return Math.min(...prices.map((p) => p.amount))
}

/** Formats an amount as a currency string. Prices are NOT in cents (project convention). */
export function formatPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}
