'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'
import type { Cart, CartAddress } from './use-cart'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ShippingOption {
  id: string
  name: string
  amount: number
  provider_id?: string
}

export interface CheckoutAddressPayload {
  email: string
  shipping_address: CartAddress
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function updateCartAddress(
  cartId: string,
  payload: CheckoutAddressPayload
): Promise<Cart> {
  const headers = await buildStoreHeaders()
  const res = await fetch(`${getBackendUrl()}/store/carts/${cartId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: payload.email,
      shipping_address: payload.shipping_address,
    }),
  })
  if (!res.ok) throw new Error('Failed to update shipping address')
  const data = (await res.json()) as { cart: Cart }
  return data.cart
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
  if (!res.ok) throw new Error('Failed to set shipping method')
  const data = (await res.json()) as { cart: Cart }
  return data.cart
}

async function initPaymentSession(cartId: string, providerId: string): Promise<Cart> {
  const headers = await buildStoreHeaders()
  // Create payment collection for cart
  const collRes = await fetch(`${getBackendUrl()}/store/payment-collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ cart_id: cartId }),
  })
  if (!collRes.ok) throw new Error('Failed to create payment collection')
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
  if (!sessRes.ok) throw new Error('Failed to create payment session')

  // Re-fetch cart to get updated payment_collection
  const cartRes = await fetch(`${getBackendUrl()}/store/carts/${cartId}`, {
    headers: await buildStoreHeaders(),
  })
  const cartData = (await cartRes.json()) as { cart: Cart }
  return cartData.cart
}

async function completeCart(cartId: string): Promise<{ order_id: string }> {
  const headers = await buildStoreHeaders()
  const res = await fetch(`${getBackendUrl()}/store/carts/${cartId}/complete`, {
    method: 'POST',
    headers,
  })
  if (!res.ok) throw new Error('Failed to complete order')
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
