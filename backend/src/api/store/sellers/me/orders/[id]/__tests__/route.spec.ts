/**
 * Unit tests for GET /store/sellers/me/orders/:id
 *
 * Tests the handler in isolation using mocked Medusa framework dependencies.
 * vi.mock() calls are hoisted above imports by vitest's transform, so the route
 * module receives the stubs when it loads.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@medusajs/framework/http", () => ({}))
vi.mock("@medusajs/framework/utils", () => {
  class MedusaError extends Error {
    type: string
    static Types = { NOT_FOUND: "NOT_FOUND", NOT_ALLOWED: "NOT_ALLOWED" }
    constructor(type: string, message: string) {
      super(message)
      this.type = type
    }
  }
  return {
    ContainerRegistrationKeys: { QUERY: "query" },
    MedusaError,
  }
})

import { GET } from "../route"

// ─── Test helpers ─────────────────────────────────────────────────────────────

const QUERY_KEY = "query"
const SELLER_KEY = "seller"

function buildSellerService(seller: { id: string } | null) {
  return { getSellerByCustomerId: vi.fn().mockResolvedValue(seller) }
}

function buildQueryGraph(...calls: unknown[]) {
  const mock = vi.fn()
  calls.forEach((result) => mock.mockResolvedValueOnce(result))
  return mock
}

function buildReq({
  customerId = "cust_1",
  orderId = "order_1",
  sellerService,
  queryGraph,
}: {
  customerId?: string
  orderId?: string
  sellerService: ReturnType<typeof buildSellerService>
  queryGraph: ReturnType<typeof vi.fn>
}) {
  return {
    auth_context: { actor_id: customerId },
    params: { id: orderId },
    scope: {
      resolve: vi.fn((key: string) => {
        if (key === QUERY_KEY) return { graph: queryGraph }
        if (key === SELLER_KEY) return sellerService
        return {}
      }),
    },
  }
}

function buildRes() {
  let _status = 200
  let _body: unknown = null
  const res = {
    get statusCode() { return _status },
    get body() { return _body },
    status(code: number) { _status = code; return res },
    json(body: unknown) { _body = body; return res },
  }
  return res
}

// Minimal order fixture for reuse across tests
const BASE_ORDER = {
  id: "order_1",
  display_id: 101,
  status: "pending",
  fulfillment_status: "not_fulfilled",
  payment_status: "captured",
  currency_code: "usd",
  created_at: "2026-05-18T12:00:00Z",
  customer: { id: "cust_1", first_name: "Bob", last_name: "Jones", email: "bob@example.com" },
  shipping_address: {
    first_name: "Bob",
    last_name: "Jones",
    address_1: "123 Main St",
    city: "New York",
    country_code: "us",
    postal_code: "10001",
  },
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /store/sellers/me/orders/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("throws NOT_FOUND when the seller profile does not exist", async () => {
    const sellerService = buildSellerService(null)
    const queryGraph = buildQueryGraph()
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await expect(GET(req as any, res as any)).rejects.toMatchObject({
      type: "NOT_FOUND",
    })
    expect(queryGraph).not.toHaveBeenCalled()
  })

  it("throws NOT_FOUND when the order does not exist", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }] }] }, // seller products
      { data: [] } // order not found
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await expect(GET(req as any, res as any)).rejects.toMatchObject({
      type: "NOT_FOUND",
    })
  })

  it("throws NOT_ALLOWED when the order contains none of the seller's products", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_seller" }] }] },
      {
        data: [
          {
            ...BASE_ORDER,
            items: [
              // All items belong to a different seller's product
              { id: "item_1", product_id: "prod_other", quantity: 1, unit_price: 500, total: 500 },
            ],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await expect(GET(req as any, res as any)).rejects.toMatchObject({
      type: "NOT_ALLOWED",
    })
  })

  it("returns order scoped to seller items with correct seller_subtotal", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }] }] },
      {
        data: [
          {
            ...BASE_ORDER,
            items: [
              { id: "item_1", title: "Seller Item", product_id: "prod_1",   quantity: 2, unit_price: 1000, total: 2000 },
              { id: "item_2", title: "Other Item",  product_id: "prod_other", quantity: 1, unit_price: 300, total: 300 },
            ],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    const { order } = res.body as { order: any }
    expect(order.id).toBe("order_1")
    expect(order.items).toHaveLength(1)
    expect(order.items[0].id).toBe("item_1")
    expect(order.seller_subtotal).toBe(2000)
  })

  it("includes shipping_address in the response", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }] }] },
      {
        data: [
          {
            ...BASE_ORDER,
            items: [{ id: "item_1", product_id: "prod_1", quantity: 1, unit_price: 500, total: 500 }],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    const { order } = res.body as { order: any }
    expect(order.shipping_address).toMatchObject({
      address_1: "123 Main St",
      city: "New York",
      country_code: "us",
    })
  })

  it("computes seller_subtotal via unit_price × quantity when total is absent", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }] }] },
      {
        data: [
          {
            ...BASE_ORDER,
            items: [
              // no `total` field
              { id: "item_1", product_id: "prod_1", quantity: 4, unit_price: 750 },
            ],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    const { order } = res.body as { order: any }
    expect(order.seller_subtotal).toBe(3000) // 4 × 750
  })

  it("handles a seller with no linked products and returns NOT_ALLOWED on any order", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1" }] }, // no product field
      {
        data: [
          {
            ...BASE_ORDER,
            items: [{ id: "item_1", product_id: "prod_1", quantity: 1, unit_price: 100, total: 100 }],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    // productIds is empty → sellerItems will be empty → NOT_ALLOWED
    await expect(GET(req as any, res as any)).rejects.toMatchObject({
      type: "NOT_ALLOWED",
    })
  })

  it("sums seller_subtotal across multiple seller items in the same order", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }, { id: "prod_2" }] }] },
      {
        data: [
          {
            ...BASE_ORDER,
            items: [
              { id: "item_1", product_id: "prod_1", quantity: 1, unit_price: 300, total: 300 },
              { id: "item_2", product_id: "prod_2", quantity: 2, unit_price: 150, total: 300 },
              { id: "item_3", product_id: "prod_other", quantity: 5, unit_price: 100, total: 500 },
            ],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    const { order } = res.body as { order: any }
    expect(order.items).toHaveLength(2)
    expect(order.seller_subtotal).toBe(600) // 300 + 300
  })
})
