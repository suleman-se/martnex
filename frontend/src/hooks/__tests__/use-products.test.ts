import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'
import { useProducts, useProduct, getDisplayPrice } from '../use-products'
import type { StoreProduct } from '../use-products'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/medusa-client', () => ({
  getBackendUrl: () => 'http://localhost:9001',
  buildStoreHeaders: vi.fn().mockResolvedValue({
    'Content-Type': 'application/json',
    'x-publishable-api-key': 'test-key',
  }),
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
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ products: [MOCK_PRODUCT], count: 1 }),
    })

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.data?.products).toHaveLength(1))

    expect(result.current.data?.products[0].title).toBe('Test T-Shirt')
    expect(result.current.data?.count).toBe(1)
  })

  it('passes search query in the request URL', async () => {
    let capturedUrl = ''
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url
      return Promise.resolve({
        ok: true,
        json: async () => ({ products: [], count: 0 }),
      })
    })

    const { result } = renderHook(() => useProducts({ q: 'shirt' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(capturedUrl).toContain('q=shirt')
  })

  it('passes category_id filter in the request URL', async () => {
    let capturedUrl = ''
    global.fetch = vi.fn().mockImplementation((url: string) => {
      capturedUrl = url
      return Promise.resolve({
        ok: true,
        json: async () => ({ products: [], count: 0 }),
      })
    })

    renderHook(() => useProducts({ category_id: ['cat_1'] }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(capturedUrl).toContain('category_id'))
    expect(capturedUrl).toContain('cat_1')
  })

  it('returns empty array on failed fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 })

    const { result } = renderHook(() => useProducts(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.data).toBeUndefined()
  })
})

describe('useProduct', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches a product by handle', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ products: [MOCK_PRODUCT] }),
    })

    const { result } = renderHook(() => useProduct('test-t-shirt'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.data).toBeDefined())

    expect(result.current.data?.handle).toBe('test-t-shirt')
  })

  it('returns null when product is not found', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ products: [] }),
    })

    const { result } = renderHook(() => useProduct('missing-handle'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).toBeNull()
  })

  it('does not fetch when handle is empty', () => {
    global.fetch = vi.fn()

    renderHook(() => useProduct(''), { wrapper: createWrapper() })

    expect(fetch).not.toHaveBeenCalled()
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
