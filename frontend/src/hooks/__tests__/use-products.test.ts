import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { useProducts, useProduct, getDisplayPrice } from '../use-products'
import type { StoreProduct } from '../use-products'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockProductList = vi.fn()

vi.mock('@/lib/medusa-client', () => ({
  getBackendUrl: () => 'http://localhost:9001',
  buildStoreHeaders: vi.fn().mockResolvedValue({
    'Content-Type': 'application/json',
    'x-publishable-api-key': 'test-key',
  }),
  medusa: {
    store: {
      product: {
        list: (...args: any[]) => mockProductList(...args),
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

const MOCK_PRODUCT: StoreProduct = {
  id: 'prod_1',
  title: 'Test T-Shirt',
  handle: 'test-t-shirt',
  description: 'A comfortable t-shirt',
  thumbnail: 'http://localhost:9001/static/thumb.jpg',
  images: [{ id: 'img_1', url: 'http://localhost:9001/static/img.jpg' }],
  variants: [
    {
      id: 'var_1',
      title: 'S',
      prices: [{ id: 'price_1', amount: 25, currency_code: 'usd' }],
      options: [{ value: 'S' }],
    },
    {
      id: 'var_2',
      title: 'M',
      prices: [{ id: 'price_2', amount: 30, currency_code: 'usd' }],
      options: [{ value: 'M' }],
    },
  ],
  options: [{ id: 'opt_1', title: 'Size', values: [{ value: 'S' }, { value: 'M' }] }],
  categories: [],
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns products from the API', async () => {
    mockProductList.mockResolvedValue({ products: [MOCK_PRODUCT], count: 1 })

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data?.products).toHaveLength(1))

    expect(result.current.data?.products[0].title).toBe('Test T-Shirt')
    expect(result.current.data?.count).toBe(1)
  })

  it('passes search query in the request URL', async () => {
    mockProductList.mockResolvedValue({ products: [], count: 0 })

    const { result } = renderHook(() => useProducts({ q: 'shirt' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockProductList).toHaveBeenCalledWith(
      expect.objectContaining({ q: 'shirt' }),
      expect.any(Object)
    )
  })

  it('passes category_id filter in the request URL', async () => {
    mockProductList.mockResolvedValue({ products: [], count: 0 })

    renderHook(() => useProducts({ category_id: ['cat_1'] }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(mockProductList).toHaveBeenCalled())
    expect(mockProductList).toHaveBeenCalledWith(
      expect.objectContaining({ category_id: ['cat_1'] }),
      expect.any(Object)
    )
  })

  it('returns error state on failed fetch', async () => {
    mockProductList.mockRejectedValue(new Error('Fetch failed'))

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})

describe('useProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches a product by handle', async () => {
    mockProductList.mockResolvedValue({ products: [MOCK_PRODUCT] })

    const { result } = renderHook(() => useProduct('test-t-shirt'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(result.current.data?.handle).toBe('test-t-shirt')
  })

  it('returns null when product is not found', async () => {
    mockProductList.mockResolvedValue({ products: [] })

    const { result } = renderHook(() => useProduct('missing-handle'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
  })

  it('does not fetch when handle is empty', () => {
    mockProductList.mockClear()

    renderHook(() => useProduct(''), { wrapper: createWrapper() })

    expect(mockProductList).not.toHaveBeenCalled()
  })
})

describe('getDisplayPrice', () => {
  it('returns the matching currency price', () => {
    const price = getDisplayPrice(MOCK_PRODUCT, 'usd')
    expect(price).toBe(25)
  })

  it('returns the lowest price across variants for a given currency', () => {
    const price = getDisplayPrice(MOCK_PRODUCT, 'usd')
    expect(price).toBe(25) // S variant is cheaper
  })

  it('returns null when no prices exist', () => {
    const product: StoreProduct = { ...MOCK_PRODUCT, variants: [] }
    expect(getDisplayPrice(product, 'usd')).toBeNull()
  })
})
