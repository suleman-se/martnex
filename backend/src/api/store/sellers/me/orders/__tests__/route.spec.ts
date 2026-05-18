/**
 * Unit tests for GET /store/sellers/me/orders
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

/** Builds a query.graph mock that returns each provided value on successive calls. */
function buildQueryGraph(...calls: unknown[]) {
  const mock = vi.fn()
  calls.forEach((result) => mock.mockResolvedValueOnce(result))
  return mock
}

function buildReq({
  customerId = "cust_1",
  sellerService,
  queryGraph,
}: {
  customerId?: string
  sellerService: ReturnType<typeof buildSellerService>
  queryGraph: ReturnType<typeof vi.fn>
}) {
  return {
    auth_context: { actor_id: customerId },
    params: {},
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /store/sellers/me/orders", () => {
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

  it("returns empty list when seller has no linked products", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [] }] } // empty products
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    expect(res.body).toEqual({ orders: [], count: 0 })
    // The second query.graph call (orders) must NOT happen when there are no products
    expect(queryGraph).toHaveBeenCalledTimes(1)
  })

  it("returns empty list when seller has no product field in the graph response", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    // Medusa may return the seller row without the `product` field if no link exists
    const queryGraph = buildQueryGraph({ data: [{ id: "seller_1" }] })
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    expect(res.body).toEqual({ orders: [], count: 0 })
    expect(queryGraph).toHaveBeenCalledTimes(1)
  })

  it("returns empty list when no orders exist for the seller's products", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }] }] },
      { data: [] } // no orders
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    expect(res.body).toEqual({ orders: [], count: 0 })
  })

  it("returns orders scoped to seller items with correct seller_subtotal", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }, { id: "prod_2" }] }] },
      {
        data: [
          {
            id: "order_1",
            display_id: 101,
            status: "pending",
            fulfillment_status: "not_fulfilled",
            payment_status: "captured",
            currency_code: "usd",
            created_at: "2026-05-18T12:00:00Z",
            customer: { id: "cust_1", first_name: "Alice", last_name: "Smith", email: "alice@example.com" },
            items: [
              { id: "item_1", title: "Seller Product", product_id: "prod_1", quantity: 2, unit_price: 1000, total: 2000 },
              { id: "item_2", title: "Other Product",  product_id: "prod_other", quantity: 1, unit_price: 500, total: 500 },
            ],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    const { orders, count } = res.body as { orders: any[]; count: number }
    expect(count).toBe(1)
    expect(orders[0].items).toHaveLength(1)
    expect(orders[0].items[0].id).toBe("item_1")
    expect(orders[0].seller_subtotal).toBe(2000)
  })

  it("includes all items when every item belongs to the seller", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }, { id: "prod_2" }] }] },
      {
        data: [
          {
            id: "order_1",
            display_id: 102,
            status: "pending",
            currency_code: "usd",
            created_at: "2026-05-18T12:00:00Z",
            items: [
              { id: "item_1", product_id: "prod_1", quantity: 1, unit_price: 500, total: 500 },
              { id: "item_2", product_id: "prod_2", quantity: 3, unit_price: 200, total: 600 },
            ],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    const { orders } = res.body as { orders: any[] }
    expect(orders[0].items).toHaveLength(2)
    expect(orders[0].seller_subtotal).toBe(1100) // 500 + 600
  })

  it("handles a single product object (non-array) in the seller graph response", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    // Medusa may return a single object rather than an array when only one product is linked
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: { id: "prod_1" } }] },
      { data: [] }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    expect(res.body).toEqual({ orders: [], count: 0 })
    // The second graph call must have received ["prod_1"]
    expect(queryGraph.mock.calls[1][0].filters.items.product_id).toEqual(["prod_1"])
  })

  it("computes seller_subtotal via unit_price × quantity when total is absent", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }] }] },
      {
        data: [
          {
            id: "order_1",
            display_id: 103,
            status: "pending",
            currency_code: "usd",
            created_at: "2026-05-18T12:00:00Z",
            items: [
              // no `total` field — should fall back to unit_price * quantity
              { id: "item_1", product_id: "prod_1", quantity: 3, unit_price: 500 },
            ],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    const { orders } = res.body as { orders: any[] }
    expect(orders[0].seller_subtotal).toBe(1500) // 3 × 500
  })

  it("returns correct count matching the number of matching orders", async () => {
    const sellerService = buildSellerService({ id: "seller_1" })
    const queryGraph = buildQueryGraph(
      { data: [{ id: "seller_1", product: [{ id: "prod_1" }] }] },
      {
        data: [
          {
            id: "order_1",
            display_id: 201,
            status: "pending",
            currency_code: "usd",
            created_at: "2026-05-01T00:00:00Z",
            items: [{ id: "item_1", product_id: "prod_1", quantity: 1, unit_price: 100, total: 100 }],
          },
          {
            id: "order_2",
            display_id: 202,
            status: "pending",
            currency_code: "usd",
            created_at: "2026-05-02T00:00:00Z",
            items: [{ id: "item_2", product_id: "prod_1", quantity: 2, unit_price: 200, total: 400 }],
          },
        ],
      }
    )
    const req = buildReq({ sellerService, queryGraph })
    const res = buildRes()

    await GET(req as any, res as any)

    const { count } = res.body as { count: number }
    expect(count).toBe(2)
  })
})
