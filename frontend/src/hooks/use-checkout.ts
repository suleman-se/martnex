'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { buildStoreHeaders, medusa } from '@/lib/medusa-client'
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
  const body: any = {
    shipping_address: payload.shipping_address,
  }
  const trimmedEmail = payload.email?.trim()
  if (trimmedEmail) {
    body.email = trimmedEmail
  }

  const data = await medusa.store.cart.update(cartId, body, {}, headers)
  return normalizeCart(data.cart as unknown as Cart)
}

async function fetchShippingOptions(cartId: string): Promise<ShippingOption[]> {
  const headers = await buildStoreHeaders()
  const data = await medusa.store.fulfillment.listCartOptions({ cart_id: cartId }, headers)
  return (data.shipping_options as unknown as ShippingOption[]) ?? []
}

async function addShippingMethod(cartId: string, optionId: string): Promise<Cart> {
  const headers = await buildStoreHeaders()
  const data = await medusa.store.cart.addShippingMethod(
    cartId,
    { option_id: optionId },
    {},
    headers
  )
  return normalizeCart(data.cart as unknown as Cart)
}

async function initPaymentSession(cartId: string, providerId: string): Promise<Cart> {
  const headers = await buildStoreHeaders()
  const cartRes = await medusa.store.cart.retrieve(cartId, {}, headers)
  await medusa.store.payment.initiatePaymentSession(
    cartRes.cart as any,
    { provider_id: providerId },
    {},
    headers
  )
  // Re-fetch cart to get updated payment_collection
  const updatedCartRes = await medusa.store.cart.retrieve(cartId, {}, headers)
  return normalizeCart(updatedCartRes.cart as unknown as Cart)
}

async function completeCart(cartId: string): Promise<{ order_id: string }> {
  const headers = await buildStoreHeaders()
  const data = await medusa.store.cart.complete(cartId, {}, headers)
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
