'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'

// ─── Constants ────────────────────────────────────────────────────────────────

const CART_ID_KEY = 'martnex_cart_id'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartLineItem {
  id: string
  title: string
  variant_id: string
  product_id: string
  quantity: number
  unit_price: number
  total: number
  thumbnail?: string
  variant?: { id: string; title: string }
  product?: { id: string; title: string; handle: string }
}

export interface CartAddress {
  first_name?: string
  last_name?: string
  address_1?: string
  address_2?: string
  city?: string
  country_code?: string
  postal_code?: string
  phone?: string
}

export interface PaymentSession {
  id: string
  provider_id: string
  data: Record<string, unknown>
  amount: number
  status: string
}

export interface Cart {
  id: string
  email?: string
  currency_code: string
  subtotal: number
  total: number
  discount_total: number
  shipping_total: number
  tax_total: number
  items: CartLineItem[]
  shipping_address?: CartAddress
  payment_collection?: {
    id: string
    payment_sessions?: PaymentSession[]
  }
  shipping_methods?: { id: string; name?: string; amount: number }[]
  region?: {
    id: string
    countries?: { iso_2: string }[]
  }
}

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeCart(cart: Cart): Cart {
  return {
    ...cart,
    subtotal: toNumber(cart.subtotal),
    total: toNumber(cart.total),
    discount_total: toNumber(cart.discount_total),
    shipping_total: toNumber(cart.shipping_total),
    tax_total: toNumber(cart.tax_total),
    items: (cart.items ?? []).map((item) => {
      const unitPrice = toNumber(item.unit_price)
      const quantity = toNumber(item.quantity)
      const computedTotal = unitPrice * quantity
      return {
        ...item,
        quantity,
        unit_price: unitPrice,
        total: toNumber(item.total, computedTotal),
      }
    }),
  }
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function getStoredCartId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_ID_KEY)
}

function setStoredCartId(id: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(CART_ID_KEY, id)
}

export function clearStoredCartId(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(CART_ID_KEY)
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchCart(cartId: string): Promise<Cart> {
  const headers = await buildStoreHeaders()
  const res = await fetch(`${getBackendUrl()}/store/carts/${cartId}`, { headers })
  if (res.status === 404) {
    clearStoredCartId()
    throw new Error('Cart not found')
  }
  if (!res.ok) throw new Error('Failed to fetch cart')
  const data = (await res.json()) as { cart: Cart }
  return normalizeCart(data.cart)
}

async function createCart(regionId: string): Promise<Cart> {
  const headers = await buildStoreHeaders()
  const res = await fetch(`${getBackendUrl()}/store/carts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ region_id: regionId }),
  })
  if (!res.ok) throw new Error('Failed to create cart')
  const data = (await res.json()) as { cart: Cart }
  return normalizeCart(data.cart)
}

async function resolveDefaultRegionId(): Promise<string> {
  const headers = await buildStoreHeaders()
  const res = await fetch(`${getBackendUrl()}/store/regions`, { headers })
  if (!res.ok) throw new Error('Unable to resolve store region')
  const data = (await res.json()) as { regions?: { id: string }[] }
  const regionId = data.regions?.[0]?.id
  if (!regionId) throw new Error('No store region is configured')
  return regionId
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCart() {
  const queryClient = useQueryClient()
  const cartId = getStoredCartId()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart', cartId],
    queryFn: () => fetchCart(cartId!),
    enabled: Boolean(cartId),
    staleTime: 30_000,
    retry: false,
  })

  // Add item — creates cart lazily if none exists
  const addItem = useMutation({
    mutationFn: async ({
      variantId,
      quantity,
      regionId,
    }: {
      variantId: string
      quantity: number
      regionId?: string
    }) => {
      let id = getStoredCartId()
      if (!id) {
        const resolvedRegionId = regionId ?? (await resolveDefaultRegionId())
        const newCart = await createCart(resolvedRegionId)
        setStoredCartId(newCart.id)
        id = newCart.id
      }
      const headers = await buildStoreHeaders()
      const res = await fetch(`${getBackendUrl()}/store/carts/${id}/line-items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ variant_id: variantId, quantity }),
      })
      if (!res.ok) throw new Error('Failed to add item to cart')
      const data = (await res.json()) as { cart: Cart }
      return normalizeCart(data.cart)
    },
    onSuccess: (updatedCart) => {
      setStoredCartId(updatedCart.id)
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Remove a line item
  const removeItem = useMutation({
    mutationFn: async (lineItemId: string) => {
      const id = getStoredCartId()
      if (!id) throw new Error('No active cart')
      const headers = await buildStoreHeaders()
      const res = await fetch(
        `${getBackendUrl()}/store/carts/${id}/line-items/${lineItemId}`,
        { method: 'DELETE', headers }
      )
      if (!res.ok) throw new Error('Failed to remove item')
      const data = (await res.json()) as { cart?: Cart; parent?: Cart }
      const updatedCart = data.cart ?? data.parent
      if (!updatedCart) throw new Error('Invalid cart response')
      return normalizeCart(updatedCart)
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  // Update line item quantity
  const updateQuantity = useMutation({
    mutationFn: async ({
      lineItemId,
      quantity,
    }: {
      lineItemId: string
      quantity: number
    }) => {
      const id = getStoredCartId()
      if (!id) throw new Error('No active cart')
      const headers = await buildStoreHeaders()
      const res = await fetch(
        `${getBackendUrl()}/store/carts/${id}/line-items/${lineItemId}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ quantity }),
        }
      )
      if (!res.ok) throw new Error('Failed to update quantity')
      const data = (await res.json()) as { cart: Cart }
      return normalizeCart(data.cart)
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
    },
  })

  // Update cart fields (email, shipping_address, etc.)
  const updateCart = useMutation({
    mutationFn: async (payload: Partial<Cart> & { email?: string }) => {
      const id = getStoredCartId()
      if (!id) throw new Error('No active cart')
      const headers = await buildStoreHeaders()
      const res = await fetch(`${getBackendUrl()}/store/carts/${id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to update cart')
      const data = (await res.json()) as { cart: Cart }
      return normalizeCart(data.cart)
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
    },
  })

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return {
    cart,
    cartId: cartId ?? cart?.id,
    isLoading: isLoading && Boolean(cartId),
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    updateCart,
    clearStoredCartId,
  }
}
