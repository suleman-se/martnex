'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buildStoreHeaders, medusa } from '@/lib/medusa-client'

import { useUIStore } from '@/hooks/use-ui-store'

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
  variant_title?: string
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
  try {
    const data = await medusa.store.cart.retrieve(cartId, {}, headers)
    return normalizeCart(data.cart as unknown as Cart)
  } catch (err: any) {
    if (err.status === 404 || err.statusCode === 404 || String(err).includes('404')) {
      clearStoredCartId()
    }
    throw err
  }
}

async function createCart(regionId: string): Promise<Cart> {
  const headers = await buildStoreHeaders()
  const data = await medusa.store.cart.create({ region_id: regionId }, {}, headers)
  return normalizeCart(data.cart as unknown as Cart)
}

async function resolveDefaultRegionId(): Promise<string> {
  const headers = await buildStoreHeaders()
  const data = await medusa.store.region.list({}, headers)
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
      const data = await medusa.store.cart.createLineItem(
        id,
        { variant_id: variantId, quantity },
        {},
        headers
      )
      return normalizeCart(data.cart as unknown as Cart)
    },
    onSuccess: (updatedCart) => {
      setStoredCartId(updatedCart.id)
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      useUIStore.getState().openCart()
    },
  })

  // Remove a line item
  const removeItem = useMutation({
    mutationFn: async (lineItemId: string) => {
      const id = getStoredCartId()
      if (!id) throw new Error('No active cart')
      const headers = await buildStoreHeaders()
      const data = await medusa.store.cart.deleteLineItem(id, lineItemId, {}, headers)
      const updatedCart = data.cart ?? data.parent
      if (!updatedCart) throw new Error('Invalid cart response')
      return normalizeCart(updatedCart as unknown as Cart)
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
      const data = await medusa.store.cart.updateLineItem(
        id,
        lineItemId,
        { quantity },
        {},
        headers
      )
      return normalizeCart(data.cart as unknown as Cart)
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
      const data = await medusa.store.cart.update(id, payload as any, {}, headers)
      return normalizeCart(data.cart as unknown as Cart)
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
