import { buildStoreHeaders, medusa, getBackendUrl } from './medusa-client'
import { AddressInput, CustomerAddress } from '@/types/address'

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

export interface ProductCategory {
  id: string
  name: string
  description: string
  handle: string
  parent_category_id: string | null
}

// ─── API Fields ──────────────────────────────────────────────────────────────

const PRODUCT_FIELDS =
  'id,title,handle,thumbnail,description,images.id,images.url,' +
  'variants.id,variants.title,variants.prices.amount,variants.prices.currency_code,' +
  'variants.options.value,variants.options.option_id,' +
  'options.id,options.title,options.values.value,' +
  'categories.id,categories.name,categories.handle,' +
  'collection.id,collection.title'

// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<{ products: StoreProduct[]; count: number }> {
  const headers = await buildStoreHeaders()
  const query: any = {
    fields: PRODUCT_FIELDS,
  }
  if (params.q) query.q = params.q
  if (params.limit !== undefined) query.limit = params.limit
  if (params.offset !== undefined) query.offset = params.offset
  if (params.category_id?.length) query.category_id = params.category_id
  if (params.collection_id?.length) query.collection_id = params.collection_id

  const data = await medusa.store.product.list(query, headers)
  return {
    products: (data.products as unknown as StoreProduct[]) ?? [],
    count: data.count ?? 0,
  }
}

export async function fetchProductByHandle(handle: string): Promise<StoreProduct | null> {
  const headers = await buildStoreHeaders()
  const data = await medusa.store.product.list(
    { handle, fields: PRODUCT_FIELDS },
    headers
  )
  return (data.products?.[0] as unknown as StoreProduct) ?? null
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function fetchProductCategories(): Promise<ProductCategory[]> {
  const headers = await buildStoreHeaders()
  const data = await medusa.store.category.list({}, headers)
  return (data.categories as unknown as ProductCategory[]) || []
}

// ─── Price Helpers ────────────────────────────────────────────────────────────

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

// ─── Sellers ──────────────────────────────────────────────────────────────────

export interface SellerProfile {
  id: string
  business_name: string
  business_email: string
  verification_status: string
  verified_at: string | null
  created_at: string
}

export interface FetchSellerResponse {
  seller: SellerProfile
  products: StoreProduct[]
}

export async function fetchSellerById(id: string): Promise<FetchSellerResponse | null> {
  const headers = await buildStoreHeaders()
  try {
    const res = await fetch(`${getBackendUrl()}/store/sellers/${id}`, {
      headers,
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error(`Failed to fetch seller: ${res.statusText}`)
    }
    const data = await res.json()
    return data as FetchSellerResponse
  } catch (err) {
    console.error('Error fetching seller by ID:', err)
    return null
  }
}

// ─── Customer / Buyer Portal ──────────────────────────────────────────────────

/** Retrieve current logged-in buyer details */
export async function fetchMe(token?: string): Promise<{ customer: any }> {
  const headers = await buildStoreHeaders(token)
  const res = await fetch(`${getBackendUrl()}/store/customers/me`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch current customer: ${res.statusText}`)
  }
  return res.json()
}

/** Retrieve customer order history list */
export async function fetchCustomerOrders(
  limit = 10,
  offset = 0,
  token?: string
): Promise<{ orders: any[]; count: number }> {
  const headers = await buildStoreHeaders(token)
  const res = await fetch(
    `${getBackendUrl()}/store/orders?limit=${limit}&offset=${offset}`,
    {
      headers,
      cache: 'no-store',
    }
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch customer orders: ${res.statusText}`)
  }
  return res.json()
}

/** Update customer profile data */
export async function updateCustomer(
  payload: { first_name?: string; last_name?: string; phone?: string },
  token?: string
): Promise<any> {
  const headers = await buildStoreHeaders(token)
  const res = await fetch(`${getBackendUrl()}/store/customers/me`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Failed to update customer: ${res.statusText}`)
  }
  return res.json()
}

/** Add a shipping address */
export async function addCustomerAddress(
  address: AddressInput,
  token?: string
): Promise<{ address: CustomerAddress }> {
  const headers = await buildStoreHeaders(token)
  const res = await fetch(`${getBackendUrl()}/store/customers/me/addresses`, {
    method: 'POST',
    headers,
    body: JSON.stringify(address),
  })
  if (!res.ok) {
    throw new Error(`Failed to add customer address: ${res.statusText}`)
  }
  return res.json()
}

/** Update a shipping address */
export async function updateCustomerAddress(
  addressId: string,
  address: Partial<AddressInput>,
  token?: string
): Promise<{ address: CustomerAddress }> {
  const headers = await buildStoreHeaders(token)
  const res = await fetch(`${getBackendUrl()}/store/customers/me/addresses/${addressId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(address),
  })
  if (!res.ok) {
    throw new Error(`Failed to update customer address: ${res.statusText}`)
  }
  return res.json()
}

/** Delete a shipping address */
export async function deleteCustomerAddress(
  addressId: string,
  token?: string
): Promise<{ id: string; object: string; deleted: boolean }> {
  const headers = await buildStoreHeaders(token)
  const res = await fetch(`${getBackendUrl()}/store/customers/me/addresses/${addressId}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) {
    throw new Error(`Failed to delete customer address: ${res.statusText}`)
  }
  return res.json()
}


