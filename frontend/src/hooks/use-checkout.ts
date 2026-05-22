'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'
import type { Cart, CartAddress } from './use-cart'

function toNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (Number.isFinite(n)) return n
  return Number.isFinite(fallback) ? fallback : 0
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
        unit_price: unitPrice,
        quantity,
        total: toNumber(item.total, computedTotal),
      }
    }),
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShippingOption {
  id: string
  name: string
  amount: number
  provider_id?: string
}

export interface CheckoutAddressPayload {
  email?: string
  shipping_address: CartAddress
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function updateCartAddress(
  cartId: string,
  payload: CheckoutAddressPayload
): Promise<Cart> {
  const headers = await buildStoreHeaders()
  const body: { email?: string; shipping_address: CartAddress } = {
    shipping_address: payload.shipping_address,
  }
  const trimmedEmail = payload.email?.trim()
  if (trimmedEmail) {
    body.email = trimmedEmail
  }

  const res = await fetch(`${getBackendUrl()}/store/carts/${cartId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errorData = (await res.json().catch(() => null)) as
      | { message?: string }
      | null
    throw new Error(errorData?.message || 'Failed to update shipping address')
  }
  const data = (await res.json()) as { cart: Cart }
  return normalizeCart(data.cart)
}

async function fetchShippingOptions(cartId: string): Promise<ShippingOption[]> {
  const headers = await buildStoreHeaders()
  const res = await fetch(
    `${getBackendUrl()}/store/shipping-options?cart_id=${cartId}`,
    { headers }
  )
  if (!res.ok) return []
  const data = (await res.json()) as { shipping_options: ShippingOption[] }
  return data.shipping_options ?? []
}

async function addShippingMethod(cartId: string, optionId: string): Promise<Cart> {
  const headers = await buildStoreHeaders()
  const res = await fetch(`${getBackendUrl()}/store/carts/${cartId}/shipping-methods`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ option_id: optionId }),
  })
  if (!res.ok) {
    const errorData = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorData?.message || 'Failed to set shipping method')
  }
  const data = (await res.json()) as { cart: Cart }
  return normalizeCart(data.cart)
}

async function initPaymentSession(cartId: string, providerId: string): Promise<Cart> {
  const headers = await buildStoreHeaders()
  // Create payment collection for cart
  const collRes = await fetch(`${getBackendUrl()}/store/payment-collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cart_id: cartId }),
  })
  if (!collRes.ok) {
    const errorData = (await collRes.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorData?.message || 'Failed to create payment collection')
  }
  const collData = (await collRes.json()) as { payment_collection: { id: string } }
  const collectionId = collData.payment_collection.id

  // Create payment session for provider
  const sessRes = await fetch(
    `${getBackendUrl()}/store/payment-collections/${collectionId}/payment-sessions`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ provider_id: providerId }),
    }
  )
  if (!sessRes.ok) {
    const errorData = (await sessRes.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorData?.message || 'Failed to create payment session')
  }

  // Re-fetch cart to get updated payment_collection
  const cartRes = await fetch(`${getBackendUrl()}/store/carts/${cartId}`, {
    headers: await buildStoreHeaders(),
  })
  const cartData = (await cartRes.json()) as { cart: Cart }
  return normalizeCart(cartData.cart)
}

async function completeCart(cartId: string): Promise<{ order_id: string }> {
  const headers = await buildStoreHeaders()
  const res = await fetch(`${getBackendUrl()}/store/carts/${cartId}/complete`, {
    method: 'POST',
    headers,
  })
  if (!res.ok) {
    const errorData = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorData?.message || 'Failed to complete order')
  }
  const data = (await res.json()) as { type: string; order?: { id: string }; cart?: Cart }
  if (data.type === 'order' && data.order?.id) {
    return { order_id: data.order.id }
  }
  throw new Error('Cart completion did not produce an order')
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCheckout() {
  const queryClient = useQueryClient()

  const setAddressMutation = useMutation({
    mutationFn: ({
      cartId,
      payload,
    }: {
      cartId: string
      payload: CheckoutAddressPayload
    }) => updateCartAddress(cartId, payload),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
    },
  })

  const getShippingOptions = async (cartId: string) => fetchShippingOptions(cartId)

  const setShippingMethodMutation = useMutation({
    mutationFn: ({ cartId, optionId }: { cartId: string; optionId: string }) =>
      addShippingMethod(cartId, optionId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
    },
  })

  const initPaymentMutation = useMutation({
    mutationFn: ({ cartId, providerId }: { cartId: string; providerId: string }) =>
      initPaymentSession(cartId, providerId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
    },
  })

  const completeMutation = useMutation({
    mutationFn: (cartId: string) => completeCart(cartId),
    onSuccess: () => {
      // Cart is done — invalidate cart queries
      queryClient.removeQueries({ queryKey: ['cart'] })
    },
  })

  return {
    setAddress: setAddressMutation,
    getShippingOptions,
    setShippingMethod: setShippingMethodMutation,
    initPayment: initPaymentMutation,
    completeOrder: completeMutation,
  }
}
