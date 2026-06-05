import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { useCart } from '../use-cart'
import type { Cart } from '../use-cart'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockCartRetrieve = vi.fn()
const mockRegionList = vi.fn()
const mockCartCreate = vi.fn()
const mockCartCreateLineItem = vi.fn()
const mockCartDeleteLineItem = vi.fn()
const mockCartUpdateLineItem = vi.fn()

vi.mock('@/lib/medusa-client', () => ({
  getBackendUrl: () => 'http://localhost:9001',
  buildStoreHeaders: vi.fn().mockResolvedValue({ 'Content-Type': 'application/json' }),
  medusa: {
    store: {
      cart: {
        retrieve: (...args: any[]) => mockCartRetrieve(...args),
        create: (...args: any[]) => mockCartCreate(...args),
        createLineItem: (...args: any[]) => mockCartCreateLineItem(...args),
        deleteLineItem: (...args: any[]) => mockCartDeleteLineItem(...args),
        updateLineItem: (...args: any[]) => mockCartUpdateLineItem(...args),
      },
      region: {
        list: (...args: any[]) => mockRegionList(...args),
      },
    },
  },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const MOCK_CART: Cart = {
  id: 'cart_1',
  currency_code: 'usd',
  subtotal: 50,
  total: 55,
  discount_total: 0,
  shipping_total: 5,
  tax_total: 0,
  items: [
    {
      id: 'li_1',
      title: 'Test T-Shirt – S',
      variant_id: 'var_1',
      product_id: 'prod_1',
      quantity: 2,
      unit_price: 25,
      total: 50,
    },
  ],
}

const MOCK_CART_AFTER_REMOVE: Cart = {
  ...MOCK_CART,
  items: [],
  subtotal: 0,
  total: 0,
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('returns empty state when no cart ID is stored', () => {
    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })

    expect(result.current.cart).toBeUndefined()
    expect(result.current.itemCount).toBe(0)
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches existing cart by stored ID', async () => {
    localStorage.setItem('martnex_cart_id', 'cart_1')
    mockCartRetrieve.mockResolvedValue({ cart: MOCK_CART })

    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.cart).toBeDefined())

    expect(result.current.cart?.id).toBe('cart_1')
    expect(result.current.itemCount).toBe(2)
  })

  it('clears stored cart ID on 404 response', async () => {
    localStorage.setItem('martnex_cart_id', 'cart_expired')
    mockCartRetrieve.mockRejectedValue({ status: 404 })

    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(localStorage.getItem('martnex_cart_id')).toBeNull()
  })

  it('addItem creates a new cart when none exists', async () => {
    const newCart: Cart = { ...MOCK_CART, id: 'cart_new' }

    mockRegionList.mockResolvedValue({ regions: [{ id: 'reg_1' }] })
    mockCartCreate.mockResolvedValue({ cart: newCart })
    mockCartCreateLineItem.mockResolvedValue({ cart: newCart })

    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })

    await act(async () => {
      await result.current.addItem.mutateAsync({
        variantId: 'var_1',
        quantity: 1,
        regionId: 'reg_1',
      })
    })

    expect(localStorage.getItem('martnex_cart_id')).toBe('cart_new')
    expect(mockRegionList).not.toHaveBeenCalled() // Region ID was passed directly
    expect(mockCartCreate).toHaveBeenCalledWith({ region_id: 'reg_1' }, {}, expect.any(Object))
    expect(mockCartCreateLineItem).toHaveBeenCalledWith('cart_new', { variant_id: 'var_1', quantity: 1 }, {}, expect.any(Object))
  })

  it('addItem adds to existing cart without creating a new one', async () => {
    localStorage.setItem('martnex_cart_id', 'cart_1')
    const updatedCart: Cart = {
      ...MOCK_CART,
      items: [...MOCK_CART.items, { ...MOCK_CART.items[0], id: 'li_2', quantity: 1 }],
    }

    mockCartRetrieve.mockResolvedValue({ cart: MOCK_CART })
    mockCartCreateLineItem.mockResolvedValue({ cart: updatedCart })

    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.cart).toBeDefined())

    await act(async () => {
      await result.current.addItem.mutateAsync({
        variantId: 'var_2',
        quantity: 1,
        regionId: 'reg_1',
      })
    })

    expect(mockCartCreate).not.toHaveBeenCalled()
    expect(mockCartCreateLineItem).toHaveBeenCalledWith('cart_1', { variant_id: 'var_2', quantity: 1 }, {}, expect.any(Object))
  })

  it('removeItem removes a line item and updates cart state', async () => {
    localStorage.setItem('martnex_cart_id', 'cart_1')

    mockCartRetrieve
      .mockResolvedValueOnce({ cart: MOCK_CART })
      .mockResolvedValue({ cart: MOCK_CART_AFTER_REMOVE })
    mockCartDeleteLineItem.mockResolvedValue({ cart: MOCK_CART_AFTER_REMOVE })

    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.cart?.items).toHaveLength(1))

    await act(async () => {
      await result.current.removeItem.mutateAsync('li_1')
    })

    await waitFor(() => expect(result.current.cart?.items).toHaveLength(0))
    expect(mockCartDeleteLineItem).toHaveBeenCalledWith('cart_1', 'li_1', {}, expect.any(Object))
  })

  it('updateQuantity sends PUT with new quantity', async () => {
    localStorage.setItem('martnex_cart_id', 'cart_1')
    const updatedCart: Cart = {
      ...MOCK_CART,
      items: [{ ...MOCK_CART.items[0], quantity: 5, total: 125 }],
    }

    mockCartRetrieve.mockResolvedValue({ cart: MOCK_CART })
    mockCartUpdateLineItem.mockResolvedValue({ cart: updatedCart })

    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.cart).toBeDefined())

    await act(async () => {
      await result.current.updateQuantity.mutateAsync({ lineItemId: 'li_1', quantity: 5 })
    })

    await waitFor(() => expect(result.current.cart?.items[0].quantity).toBe(5))
    expect(mockCartUpdateLineItem).toHaveBeenCalledWith('cart_1', 'li_1', { quantity: 5 }, {}, expect.any(Object))
  })

  it('itemCount sums quantities across all line items', async () => {
    localStorage.setItem('martnex_cart_id', 'cart_1')
    const multiItemCart: Cart = {
      ...MOCK_CART,
      items: [
        { ...MOCK_CART.items[0], id: 'li_1', quantity: 3 },
        { ...MOCK_CART.items[0], id: 'li_2', quantity: 2 },
      ],
    }

    mockCartRetrieve.mockResolvedValue({ cart: multiItemCart })

    const { result } = renderHook(() => useCart(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.itemCount).toBe(5))
  })
})
