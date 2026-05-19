# Seller Order Fulfillment — Phase 4 Completion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the static seller orders mockup with a fully functional real-data orders view, and implement commission creation when an order is placed.

**Architecture:** Medusa v2 layered flow — query Medusa's core order module for orders that contain the seller's products (via the `seller-product` link), filter line items per-seller, and surface data via React Query in the existing UI shell. Commission records are created asynchronously in the `order.placed` subscriber.

**Tech Stack:** Medusa v2, Next.js 16, React Query, Tailwind CSS v4, TypeScript strict.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `backend/src/api/store/sellers/me/orders/route.ts` | `GET /store/sellers/me/orders` — paginated list |
| Create | `backend/src/api/store/sellers/me/orders/[id]/route.ts` | `GET /store/sellers/me/orders/:id` — detail + ownership check |
| Modify | `backend/src/api/middlewares.ts` | Add `authenticate` guard for new order routes |
| Modify | `backend/src/subscribers/order-placed.ts` | Implement real commission creation logic |
| Create | `frontend/src/hooks/use-seller-orders.ts` | React Query hook + type definitions |
| Modify | `frontend/src/app/seller/orders/page.tsx` | Replace static data with real hook, add loading/empty states |

---

### Task 1: Backend — Seller Orders List API

**Files:**
- Create: `backend/src/api/store/sellers/me/orders/route.ts`

The approach uses two `query.graph` calls:
1. Get seller's product IDs via the `seller-product` module link.
2. Query `order` entity filtering by `items.product_id` (items are within the same order module — `data-same-module-ok` rule applies).
3. Strip non-seller line items and attach `seller_subtotal` per order.

- [x] **Step 1: Create the orders list route**

Create `backend/src/api/store/sellers/me/orders/route.ts`:

```typescript
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"

const SELLER_MODULE = "seller"

/**
 * GET /store/sellers/me/orders
 *
 * Returns orders that contain at least one of the authenticated seller's products.
 * Line items are scoped to the seller's products only, and a `seller_subtotal` is
 * calculated from those items.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)

  const customerId = req.auth_context.actor_id

  const seller = await sellerService.getSellerByCustomerId(customerId)
  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Seller profile not found")
  }

  // Step 1: Resolve seller's product IDs via the seller-product module link
  const { data: sellerData } = await query.graph({
    entity: "seller",
    fields: ["id", "product.id"],
    filters: { id: seller.id },
  })

  const rawProducts = sellerData[0]?.product
  const linkedProducts = Array.isArray(rawProducts)
    ? rawProducts
    : rawProducts
      ? [rawProducts]
      : []
  const productIds: string[] = linkedProducts.map((p: { id: string }) => p.id)

  if (productIds.length === 0) {
    return res.status(200).json({ orders: [], count: 0 })
  }

  // Step 2: Query orders whose line items include at least one of the seller's products.
  // `items` live in the same order module, so query.graph() can filter on them.
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "status",
      "fulfillment_status",
      "payment_status",
      "currency_code",
      "created_at",
      "customer.id",
      "customer.first_name",
      "customer.last_name",
      "customer.email",
      "items.id",
      "items.title",
      "items.product_id",
      "items.variant_id",
      "items.quantity",
      "items.unit_price",
      "items.total",
      "items.thumbnail",
    ],
    filters: {
      items: { product_id: productIds },
    },
  })

  // Step 3: Scope items to seller's products and compute seller subtotal
  const sellerOrders = orders.map((order: Record<string, unknown>) => {
    const allItems = (order.items as { product_id: string; total?: number; unit_price?: number; quantity?: number }[] | undefined) ?? []
    const sellerItems = allItems.filter((item) => productIds.includes(item.product_id))
    const sellerSubtotal = sellerItems.reduce(
      (sum, item) => sum + (item.total ?? (item.unit_price ?? 0) * (item.quantity ?? 1)),
      0
    )
    return { ...order, items: sellerItems, seller_subtotal: sellerSubtotal }
  })

  res.status(200).json({ orders: sellerOrders, count: sellerOrders.length })
}
```

- [x] **Step 2: Commit**

```bash
git add backend/src/api/store/sellers/me/orders/route.ts
git commit -m "feat(backend): add GET /store/sellers/me/orders endpoint"
```

---

### Task 2: Backend — Seller Order Detail API

**Files:**
- Create: `backend/src/api/store/sellers/me/orders/[id]/route.ts`

- [x] **Step 1: Create the order detail route**

Create `backend/src/api/store/sellers/me/orders/[id]/route.ts`:

```typescript
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import type SellerModuleService from "@modules/seller/service"

const SELLER_MODULE = "seller"

/**
 * GET /store/sellers/me/orders/:id
 *
 * Returns a single order scoped to the authenticated seller's products.
 * Returns 403 if the order contains none of the seller's products (ownership check).
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const sellerService = req.scope.resolve<SellerModuleService>(SELLER_MODULE)

  const customerId = req.auth_context.actor_id

  const seller = await sellerService.getSellerByCustomerId(customerId)
  if (!seller) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Seller profile not found")
  }

  // Get seller's product IDs
  const { data: sellerData } = await query.graph({
    entity: "seller",
    fields: ["id", "product.id"],
    filters: { id: seller.id },
  })

  const rawProducts = sellerData[0]?.product
  const linkedProducts = Array.isArray(rawProducts)
    ? rawProducts
    : rawProducts
      ? [rawProducts]
      : []
  const productIds: string[] = linkedProducts.map((p: { id: string }) => p.id)

  // Get the specific order with full detail
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "status",
      "fulfillment_status",
      "payment_status",
      "currency_code",
      "created_at",
      "customer.id",
      "customer.first_name",
      "customer.last_name",
      "customer.email",
      "shipping_address.first_name",
      "shipping_address.last_name",
      "shipping_address.address_1",
      "shipping_address.address_2",
      "shipping_address.city",
      "shipping_address.country_code",
      "shipping_address.postal_code",
      "items.id",
      "items.title",
      "items.product_id",
      "items.variant_id",
      "items.quantity",
      "items.unit_price",
      "items.total",
      "items.thumbnail",
    ],
    filters: { id },
  })

  const order = orders[0]
  if (!order) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Order not found")
  }

  // Ownership check: must contain at least one of this seller's products
  const allItems = (order.items as { product_id: string; total?: number; unit_price?: number; quantity?: number }[] | undefined) ?? []
  const sellerItems = allItems.filter((item) => productIds.includes(item.product_id))

  if (sellerItems.length === 0) {
    throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Access denied to this order")
  }

  const sellerSubtotal = sellerItems.reduce(
    (sum, item) => sum + (item.total ?? (item.unit_price ?? 0) * (item.quantity ?? 1)),
    0
  )

  res.status(200).json({
    order: { ...order, items: sellerItems, seller_subtotal: sellerSubtotal },
  })
}
```

- [x] **Step 2: Commit**

```bash
git add backend/src/api/store/sellers/me/orders/[id]/route.ts
git commit -m "feat(backend): add GET /store/sellers/me/orders/:id with ownership check"
```

---

### Task 3: Backend — Register Auth Middleware for Order Routes

**Files:**
- Modify: `backend/src/api/middlewares.ts`

- [x] **Step 1: Add authenticate guard for the new order routes**

In `backend/src/api/middlewares.ts`, add the following entry **before** the existing admin routes block (after the `uploads/:id` entry):

```typescript
    {
      matcher: "/store/sellers/me/orders*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
```

The full `routes` array should now include (in order):

```typescript
    { matcher: "/store/sellers", methods: ["POST"], middlewares: [authenticate("customer", ["session", "bearer"])] },
    { matcher: "/store/sellers/me*", middlewares: [authenticate("customer", ["session", "bearer"])] },
    { matcher: "/store/commissions*", middlewares: [authenticate("customer", ["session", "bearer"])] },
    { matcher: "/store/payouts*", middlewares: [authenticate("customer", ["session", "bearer"])] },
    { matcher: "/store/sellers/me/products*", middlewares: [authenticate("customer", ["session", "bearer"])] },
    { matcher: "/store/sellers/me/orders*", middlewares: [authenticate("customer", ["session", "bearer"])] },
    // ... uploads + admin entries below
```

> **Note:** `/store/sellers/me*` already covers `/store/sellers/me/orders*`, but the explicit entry is kept for clarity and to allow per-route method restrictions in the future.

- [x] **Step 2: Verify backend builds**

```bash
cd backend && pnpm build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [x] **Step 3: Commit**

```bash
git add backend/src/api/middlewares.ts
git commit -m "feat(backend): add auth middleware for seller orders routes"
```

---

### Task 4: Backend — Implement order.placed Commission Subscriber

**Files:**
- Modify: `backend/src/subscribers/order-placed.ts`

Replace the entire stub file with a real implementation. The subscriber:
1. Resolves Medusa's core `order` service to retrieve the placed order with items.
2. For each line item that has a `product_id`, finds the linked seller via `query.graph`.
3. Creates a `Commission` record using the seller's custom rate (or platform default of 10%).

- [x] **Step 1: Implement the subscriber**

Replace `backend/src/subscribers/order-placed.ts` with:

```typescript
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { IOrderModuleService } from "@medusajs/framework/types"
import { COMMISSION_MODULE } from "../modules/commission"

const DEFAULT_COMMISSION_RATE = 10 // 10% platform default

/**
 * order-placed subscriber
 *
 * Fires on every `order.placed` event. For each line item in the order,
 * looks up the linked seller via the seller-product module link and creates
 * a Commission record (status: "pending") using the seller's rate or the
 * platform default.
 *
 * Failures are logged but do NOT throw — we must never fail order placement.
 */
export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderId = data.id
  const logger = container.resolve("logger")

  logger.info(`[order-placed] Processing commissions for order: ${orderId}`)

  try {
    const orderService = container.resolve<IOrderModuleService>(Modules.ORDER)
    const commissionService = container.resolve(COMMISSION_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Retrieve the full order with its line items
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["items"],
    })

    const items = (order as unknown as { items?: unknown[] }).items ?? []

    if (!items.length) {
      logger.info(`[order-placed] Order ${orderId} has no items — skipping`)
      return
    }

    // Process each item in parallel; collect results to report outcomes
    const results = await Promise.allSettled(
      (items as { id: string; product_id?: string; variant_id?: string; title?: string; total?: number; unit_price?: number; quantity?: number }[])
        .filter((item) => Boolean(item.product_id))
        .map(async (item) => {
          // Find the seller linked to this product via the seller-product module link
          const { data: products } = await query.graph({
            entity: "product",
            fields: ["id", "seller.id", "seller.commission_rate"],
            filters: { id: item.product_id! },
          })

          const rawSeller = products[0]?.seller as { id: string; commission_rate?: number | null } | { id: string; commission_rate?: number | null }[] | undefined
          const seller = Array.isArray(rawSeller) ? rawSeller[0] : rawSeller

          if (!seller?.id) {
            logger.info(`[order-placed] No seller for product ${item.product_id} — skipping`)
            return null
          }

          const commissionRate: number =
            seller.commission_rate != null
              ? Number(seller.commission_rate)
              : DEFAULT_COMMISSION_RATE

          const lineItemTotal: number =
            item.total ?? (item.unit_price ?? 0) * (item.quantity ?? 1)

          const commissionAmount = (lineItemTotal * commissionRate) / 100
          const sellerPayout = lineItemTotal - commissionAmount

          return commissionService.createCommissions({
            order_id: orderId,
            line_item_id: item.id,
            seller_id: seller.id,
            product_id: item.product_id!,
            product_title: item.title ?? null,
            variant_id: item.variant_id ?? null,
            line_item_total: lineItemTotal,
            quantity: item.quantity ?? 1,
            commission_rate: commissionRate,
            commission_amount: commissionAmount,
            seller_payout: sellerPayout,
            currency_code: (order as unknown as { currency_code?: string }).currency_code ?? "usd",
            status: "pending",
          })
        })
    )

    const succeeded = results.filter((r) => r.status === "fulfilled" && r.value != null).length
    const failed = results.filter((r) => r.status === "rejected").length

    logger.info(
      `[order-placed] Order ${orderId}: ${succeeded} commission(s) created, ${failed} skipped/failed`
    )
  } catch (error) {
    logger.error(`[order-placed] Unhandled error for order ${orderId}: ${String(error)}`)
    // Do NOT re-throw — never fail order placement due to commission logic
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

- [x] **Step 2: Verify backend builds**

```bash
cd backend && pnpm build 2>&1 | tail -20
```

Expected: no TypeScript errors.

- [x] **Step 3: Commit**

```bash
git add backend/src/subscribers/order-placed.ts
git commit -m "feat(backend): implement order.placed commission creation in subscriber"
```

---

### Task 5: Frontend — useSellerOrders Hook

**Files:**
- Create: `frontend/src/hooks/use-seller-orders.ts`

- [x] **Step 1: Create the hook**

Create `frontend/src/hooks/use-seller-orders.ts`:

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SellerOrderItem {
  id: string
  title: string
  product_id: string
  variant_id?: string
  quantity: number
  unit_price: number
  total: number
  thumbnail?: string
}

export interface SellerOrder {
  id: string
  display_id: number
  status: string
  fulfillment_status?: string
  payment_status?: string
  currency_code: string
  created_at: string
  customer?: {
    id: string
    first_name?: string
    last_name?: string
    email: string
  }
  items: SellerOrderItem[]
  seller_subtotal: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps Medusa order status + fulfillment status to a human-readable display label.
 */
export function formatOrderStatus(
  status: string,
  fulfillmentStatus?: string
): string {
  if (status === 'cancelled') return 'Cancelled'
  switch (fulfillmentStatus) {
    case 'delivered':
      return 'Delivered'
    case 'shipped':
      return 'Shipped'
    case 'fulfilled':
    case 'partially_fulfilled':
      return 'Fulfilling'
    default:
      return 'Processing'
  }
}

export function formatCustomerName(customer?: SellerOrder['customer']): string {
  if (!customer) return 'Guest'
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ')
  return name || customer.email
}

export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode.toUpperCase(),
  }).format(amount)
}

// ─── API ─────────────────────────────────────────────────────────────────────

async function fetchSellerOrders(): Promise<SellerOrder[]> {
  const token = localStorage.getItem('access_token')
  const headers = await buildStoreHeaders(token ?? undefined)
  const response = await fetch(`${getBackendUrl()}/store/sellers/me/orders`, {
    headers,
    cache: 'no-store',
  })
  if (!response.ok) throw new Error('Failed to fetch orders')
  const data = (await response.json()) as { orders: SellerOrder[] }
  return data.orders ?? []
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSellerOrders() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: fetchSellerOrders,
    staleTime: 30_000,
  })

  return {
    orders: data ?? [],
    isLoading,
    error,
    refetch,
    formatOrderStatus,
    formatCustomerName,
    formatCurrency,
  }
}
```

- [x] **Step 2: Commit**

```bash
git add frontend/src/hooks/use-seller-orders.ts
git commit -m "feat(frontend): add useSellerOrders React Query hook"
```

---

### Task 6: Frontend — Wire Orders Page to Real Data

**Files:**
- Modify: `frontend/src/app/seller/orders/page.tsx`

Replace the static `orders` array with the `useSellerOrders` hook. Keep all existing visual styling. Add loading skeleton and the existing empty state (already present).

- [x] **Step 1: Replace the orders page**

Replace the full content of `frontend/src/app/seller/orders/page.tsx` with:

```typescript
'use client'

import { ShoppingBag, Search, Filter, ChevronRight, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useMounted } from '@/hooks/use-mounted'
import {
  useSellerOrders,
  formatOrderStatus,
  formatCustomerName,
  formatCurrency,
} from '@/hooks/use-seller-orders'

function StatusBadge({ status, fulfillmentStatus }: { status: string; fulfillmentStatus?: string }) {
  const label = formatOrderStatus(status, fulfillmentStatus)
  const colorMap: Record<string, string> = {
    Processing: 'bg-amber-50 text-amber-600',
    Fulfilling: 'bg-purple-50 text-purple-600',
    Shipped: 'bg-blue-50 text-primary',
    Delivered: 'bg-emerald-50 text-emerald-600',
    Cancelled: 'bg-rose-50 text-rose-600',
  }
  const colors = colorMap[label] ?? 'bg-slate-50 text-slate-500'
  return (
    <span className={`inline-flex px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colors}`}>
      {label}
    </span>
  )
}

function OrdersTableSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-slate-50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-8 py-6 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-24" />
          <div className="h-4 bg-slate-100 rounded w-20" />
          <div className="h-4 bg-slate-100 rounded w-32" />
          <div className="h-4 bg-slate-100 rounded w-16" />
          <div className="h-6 bg-slate-100 rounded-full w-20" />
        </div>
      ))}
    </div>
  )
}

export default function SellerOrdersPage() {
  const mounted = useMounted()
  const { orders, isLoading, refetch } = useSellerOrders()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredOrders = orders.filter((order) => {
    const displayLabel = formatOrderStatus(order.status, order.fulfillment_status)
    const customerName = formatCustomerName(order.customer).toLowerCase()
    const orderId = `#${order.display_id}`

    const matchesSearch =
      search === '' ||
      customerName.includes(search.toLowerCase()) ||
      orderId.includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || displayLabel.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Stats derived from live data
  const pending = orders.filter(
    (o) => o.fulfillment_status === 'not_fulfilled' || !o.fulfillment_status
  ).length
  const inTransit = orders.filter((o) => o.fulfillment_status === 'shipped').length
  const completed = orders.filter(
    (o) => o.fulfillment_status === 'delivered' || o.status === 'completed'
  ).length

  if (!mounted) return null

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black tracking-tight text-slate-900">
            Customer Orders
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Track and manage your sales and fulfillments with precision.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-3 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">
            {isLoading ? <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" /> : pending}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">In Transit</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">
            {isLoading ? <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" /> : inTransit}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-premium transition-all duration-500">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Completed</p>
          <p className="text-4xl font-heading font-black text-slate-900 mt-2">
            {isLoading ? <span className="inline-block w-8 h-8 bg-slate-100 rounded animate-pulse" /> : completed}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or customer..."
            className="w-full bg-slate-100/50 border-none rounded-[1.25rem] pl-14 pr-6 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium placeholder:text-slate-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex items-center gap-2.5 px-8 py-4 bg-white shadow-sm rounded-2xl text-slate-600 font-bold hover:bg-slate-50 transition-all cursor-pointer border-none focus:outline-none focus:ring-2 focus:ring-primary/10"
        >
          <option value="all">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="fulfilling">Fulfilling</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-premium transition-all duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Order</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Subtotal</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-right">
                  <Filter className="w-4 h-4 inline-block" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <OrdersTableSkeleton />
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/30 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <span className="font-heading font-black text-slate-900 tracking-tight">
                        #{order.display_id}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-900 font-bold">
                      {formatCustomerName(order.customer)}
                    </td>
                    <td className="px-8 py-6 text-base font-black text-slate-900 tracking-tight font-heading">
                      {formatCurrency(order.seller_subtotal, order.currency_code)}
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge
                        status={order.status}
                        fulfillmentStatus={order.fulfillment_status}
                      />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-primary transition-all active:scale-90 group-hover:translate-x-1">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filteredOrders.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center px-6">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-3xl font-heading font-black text-slate-900">No orders found</h3>
            <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
              {search || statusFilter !== 'all'
                ? 'No orders match your current filters.'
                : 'Your orders will show up here once customers start purchasing your products.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [x] **Step 2: Type-check the frontend**

```bash
cd frontend && pnpm type-check 2>&1 | tail -20
```

Expected: no errors.

- [x] **Step 3: Commit**

```bash
git add frontend/src/app/seller/orders/page.tsx
git commit -m "feat(frontend): connect seller orders page to real API data"
```

---

## Post-Implementation Verification

- [x] **Manual smoke test** — Start both backend and frontend, log in as a seller, place a test order via the Medusa admin or API, then visit `/seller/orders` and verify the order appears with the correct customer name, subtotal, and status badge.
- [x] **Commission check** — After placing an order, query `GET /admin/commissions` and verify a `pending` commission record was created with the correct `commission_rate`, `commission_amount`, and `seller_payout`.
- [x] **Empty state** — Log in as a seller with no products/orders and verify the empty state renders.
- [x] **Ownership guard** — Call `GET /store/sellers/me/orders/:id` with an order ID that belongs to a different seller and verify a 403/400 response.

---

**Status: Phase COMPLETE ✅** *(implemented & tested 2026-05-18)*

### Post-Implementation Notes
- All route tests written as pure unit tests using `vi.mock('@medusajs/framework/utils')` — 17 tests across 2 spec files, all passing.
- `useSellerOrder` (single-order hook) added alongside `useSellerOrders`; `SellerOrder` type extended with `shipping_address`.
- Order detail page (`/seller/orders/[id]`) added with line-item list, customer card, shipping address, payment status, and skeleton loading.
- Orders table rows are now fully clickable (`router.push`); ChevronRight button also navigates independently.
- Dashboard real data wired via `useDashboardStats` — fetches orders + commissions in parallel; `StatsGrid` and `ActivityFeed` show live data with loading skeletons.
- Payouts page (`/seller/payouts`) added with history table and status badges; `useSellerPayouts` + `useRequestPayout` hooks created.
- Sidebar updated: Payouts nav item added; active-state matching changed from `===` to `startsWith` for nested routes.
