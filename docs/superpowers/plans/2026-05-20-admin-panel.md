# Admin Panel — Phase 7

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all manual bootstrap scripts and CLI commands with a proper in-app Admin Panel. After this phase, a fresh install only needs `pnpm run seed` followed by logging into `/admin` — no shell scripts, no API calls, no `setup-shipping`.

**Architecture:** The admin panel extends the existing `/admin` shell (layout, sidebar, `<ProtectedRoute allowedRoles={['admin']}>`) and the existing backend `/admin/*` APIs. New pages follow the same feature-sliced pattern as the seller dashboard. All mutations go through Medusa workflows — never direct DB calls from route handlers.

**Tech Stack:** Medusa v2, Next.js 16.2, React Query, Tailwind CSS v4, TypeScript strict, shadcn/ui.

---

## Medusa Native Admin API — What We Get for Free

Admin auth: `POST /auth/user/emailpass` → returns a Bearer token (different from customer token).
All `/admin/*` Medusa routes accept this token. Custom Martnex `/admin/*` routes use `authenticate("user", ["session", "bearer"])` so they accept the **same token** ✅

> **Key insight:** Most of the admin panel is **frontend-only work** — just call Medusa's native API from the browser with the admin token. No new backend routes needed for these.

| Category | Medusa Endpoint | Status | What It Does |
|---|---|---|---|
| **Auth** | `POST /auth/user/emailpass` | ✅ live | Login as admin user → Bearer token |
| **Products** | `GET/POST/DELETE /admin/products` | ✅ live | Full product CRUD |
| **Categories** | `GET/POST/DELETE /admin/product-categories` | ✅ live | Product categories |
| **Tags** | `GET/POST/DELETE /admin/product-tags` | ✅ live | Product tags |
| **Price Lists** | `GET/POST/DELETE /admin/price-lists` | ✅ live | Price list management |
| **All Orders** | `GET /admin/orders` | ✅ live | Platform-wide orders — no custom backend needed |
| **All Customers** | `GET /admin/customers` | ✅ live | Buyers + sellers — no custom backend needed |
| **Shipping Options** | `GET/POST/DELETE /admin/shipping-options` | ✅ live | Create/edit shipping options — **replaces setup-shipping script** |
| **Stock Locations** | `GET/POST /admin/stock-locations` | ✅ live | Warehouse management |
| **Fulfillment Providers** | `GET /admin/fulfillment-providers` | ✅ live | Lists `manual_manual` and any others |
| **Provider ↔ Location** | `POST /admin/stock-locations/:id/fulfillment-providers` | ✅ live | Link provider to location — **also replaces script** |
| **Regions** | `GET/POST/DELETE /admin/regions` | ✅ live | Region + currency config |
| **Currencies** | `GET /admin/currencies` | ✅ live | All supported currencies |
| **API Keys** | `GET/POST/DELETE /admin/api-keys` | ✅ live | Publishable + secret keys — **replaces create-publishable-key script** |
| **Sales Channels** | `GET/POST /admin/sales-channels` | ✅ live | Sales channel management |
| **Inventory Items** | `GET/POST /admin/inventory-items` | ✅ live | Inventory management |
| **Tax Rates** | `GET/POST /admin/tax-rates` | ✅ live | Tax configuration |
| **Promotions** | `GET/POST/DELETE /admin/promotions` | ✅ live | Coupons and discounts |
| **Workflow Monitor** | `GET /admin/workflows-executions` | ✅ live | Monitor background jobs |

### What Martnex Adds (Custom Backend — Already Built)

| Endpoint | What It Does |
|---|---|
| `GET/POST /admin/sellers` + verify/reject/suspend | Seller lifecycle management |
| `GET/POST /admin/commissions` | Commission status management |
| `GET/POST /admin/payouts` + approve/reject | Payout approval workflow |

---

## Revised Task Impact

| Script / Manual Step | Replaced by |
|---|---|
| `pnpm run setup-shipping` | `/admin/settings/shipping` — **now: call `POST /admin/shipping-options` + `POST /admin/stock-locations/:id/fulfillment-providers` directly, no custom backend** |
| `pnpm run create-publishable-key` | `/admin/settings/store` — **now: call `POST /admin/api-keys` directly, no custom backend** |
| Direct DB seed for regions/currencies | `/admin/settings/store` — **now: call `GET/POST /admin/regions` directly, no custom backend** |
| `curl` calls to link provider to stock location | **now: `POST /admin/stock-locations/:id/fulfillment-providers` direct API call** |

> **Important:** Until this phase is complete, `pnpm run setup-shipping` is still required on a fresh install. Once the admin panel can provision the fulfillment stack via UI, the `setup-shipping` script should be **deprecated** (kept but noted as legacy).

> **Revised architecture:** Tasks 4 (orders) and 5 (users) need **no new backend routes** — use Medusa's native `GET /admin/orders` and `GET /admin/customers`. Tasks 6 and 7 (settings) are **frontend-only** — the data layer is already live via Medusa's API.

---

## What Already Exists (Do Not Recreate)

| Item | Status |
|---|---|
| `frontend/src/app/admin/layout.tsx` | ✅ Shell with `<BaseDashboardLayout>` + admin role guard |
| `frontend/src/components/admin/layout/admin-sidebar.tsx` | ✅ Nav items: Dashboard, Sellers Registry, Users, Settings |
| `frontend/src/components/admin/layout/admin-header.tsx` | ✅ Header bar |
| `frontend/src/app/admin/sellers/page.tsx` | ✅ Seller list + verify/reject actions |
| `backend/src/api/admin/sellers/route.ts` | ✅ GET list, POST update, POST /:id/verify, POST /:id/reject |
| `backend/src/api/admin/sellers/[id]/suspend/route.ts` | ✅ POST suspend |
| `backend/src/api/admin/commissions/route.ts` | ✅ GET list, POST update status |
| `backend/src/api/admin/payouts/route.ts` | ✅ GET list |
| `backend/src/api/admin/payouts/[id]/route.ts` | ✅ POST approve/reject |

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `frontend/src/app/admin/page.tsx` | Admin dashboard — overview stats |
| Create | `frontend/src/app/admin/commissions/page.tsx` | Commission list + approve/reject |
| Create | `frontend/src/app/admin/payouts/page.tsx` | Payout list + approve/reject |
| Create | `frontend/src/app/admin/orders/page.tsx` | Platform-wide order list — calls `GET /admin/orders` (Medusa native) |
| Create | `frontend/src/app/admin/users/page.tsx` | Buyer list — calls `GET /admin/customers` (Medusa native) |
| Create | `frontend/src/app/admin/settings/page.tsx` | Settings hub (tabs or sub-nav) |
| Create | `frontend/src/app/admin/settings/shipping/page.tsx` | Shipping options UI — calls Medusa `GET/POST /admin/shipping-options` |
| Create | `frontend/src/app/admin/settings/store/page.tsx` | Publishable key + region — calls Medusa `GET/POST /admin/api-keys`, `GET/POST /admin/regions` |
| Create | `frontend/src/hooks/use-admin-commissions.ts` | React Query wrapper for `/admin/commissions` |
| Create | `frontend/src/hooks/use-admin-payouts.ts` | React Query wrapper for `/admin/payouts` |
| Create | `frontend/src/hooks/use-admin-orders.ts` | React Query wrapper for Medusa `/admin/orders` |
| Create | `frontend/src/hooks/use-admin-users.ts` | React Query wrapper for Medusa `/admin/customers` |
| Create | `frontend/src/hooks/use-admin-shipping-settings.ts` | React Query wrappers for Medusa `/admin/shipping-options`, `/admin/fulfillment-providers`, `/admin/stock-locations` |
| Create | `frontend/src/hooks/use-admin-store-settings.ts` | React Query wrappers for Medusa `/admin/api-keys`, `/admin/regions` |
| ~~Create~~ | ~~`backend/src/api/admin/orders/route.ts`~~ | ~~Eliminated — use Medusa native~~ |
| ~~Create~~ | ~~`backend/src/api/admin/users/route.ts`~~ | ~~Eliminated — use Medusa native~~ |
| ~~Create~~ | ~~`backend/src/api/admin/settings/shipping/route.ts`~~ | ~~Eliminated — use Medusa native~~ |
| ~~Create~~ | ~~`backend/src/api/admin/settings/store/route.ts`~~ | ~~Eliminated — use Medusa native~~ |
| Modify | `frontend/src/components/admin/layout/admin-sidebar.tsx` | Add Commissions, Payouts, Orders nav items |
| ~~Modify~~ | ~~`backend/src/api/middlewares.ts`~~ | ~~No new admin routes to guard~~ |

---

## Task 1: Admin Dashboard Overview

**Files:** `frontend/src/app/admin/page.tsx`

The current `/admin` page is a blank shell (just the layout). Replace it with a real stats overview.

Stats to show (all computed from existing APIs):
- Total sellers (pending / approved / suspended counts)
- Platform revenue this month (sum of completed order totals)
- Total commissions earned
- Payouts pending approval

Use `<StatsGrid>`-style layout matching seller dashboard aesthetics. 4 stat cards + a recent-activity feed (last 5 orders, last 5 seller approvals).

- [ ] **Step 1.1:** Create `frontend/src/hooks/use-admin-stats.ts` — parallel fetches for sellers, commissions, payouts
- [ ] **Step 1.2:** Create `frontend/src/app/admin/page.tsx` — stats grid + activity feed

---

## Task 2: Commission Management Page

**Files:** `frontend/src/app/admin/commissions/page.tsx`, `frontend/src/hooks/use-admin-commissions.ts`

The API already exists. Build the UI on top of it.

Features:
- Table: order ID, seller name, amount, rate, status (pending / approved / rejected), date
- Filter by status
- Per-row actions: Approve / Reject (calls `POST /admin/commissions`)
- Stat bar: Total Pending, Total Approved, Total Amount

- [ ] **Step 2.1:** Create `frontend/src/hooks/use-admin-commissions.ts`
- [ ] **Step 2.2:** Create `frontend/src/app/admin/commissions/page.tsx`
- [ ] **Step 2.3:** Add "Commissions" nav item to `admin-sidebar.tsx`

---

## Task 3: Payout Approval Page

**Files:** `frontend/src/app/admin/payouts/page.tsx`, `frontend/src/hooks/use-admin-payouts.ts`

The API already exists (`GET /admin/payouts`, `POST /admin/payouts/:id` approve/reject).

Features:
- Table: seller name, amount, commission count, requested date, status
- Per-row actions: Approve / Reject (with optional rejection reason)
- Stat bar: Total Pending, Total Approved, Total Amount Paid Out

- [ ] **Step 3.1:** Create `frontend/src/hooks/use-admin-payouts.ts`
- [ ] **Step 3.2:** Create `frontend/src/app/admin/payouts/page.tsx`
- [ ] **Step 3.3:** Add "Payouts" nav item to `admin-sidebar.tsx`

---

## Task 4: Platform Orders Page

**Files:** `frontend/src/app/admin/orders/page.tsx`, `frontend/src/hooks/use-admin-orders.ts`

**No backend work needed.** Medusa's `GET /admin/orders` returns all platform orders with full detail including `items`, `customer`, `total`, `payment_status`, `fulfillment_status`, `created_at`.

The hook calls this endpoint with the admin Bearer token. The page shows a table with order ID, customer email, item count, total, payment status, date. Clicking a row expands or navigates to detail.

Note: customer's name on the order → use `order.shipping_address.first_name/last_name` since the admin orders endpoint includes the shipping address.

- [ ] **Step 4.1:** Create `frontend/src/hooks/use-admin-orders.ts` — calls `GET /admin/orders`
- [ ] **Step 4.2:** Create `frontend/src/app/admin/orders/page.tsx`
- [ ] **Step 4.3:** Add "Orders" nav item to `admin-sidebar.tsx`

---

## Task 5: User Management Page

**Files:** `frontend/src/app/admin/users/page.tsx`, `frontend/src/hooks/use-admin-users.ts`

**No backend work needed.** Medusa's `GET /admin/customers` returns all customers. Filter by `metadata.role` on the frontend to separate buyers from sellers. The sidebar already links to `/admin/users` but the page is a 404.

- [ ] **Step 5.1:** Create `frontend/src/hooks/use-admin-users.ts` — calls `GET /admin/customers`
- [ ] **Step 5.2:** Create `frontend/src/app/admin/users/page.tsx` — table with role badge, joined date, view-only in v1

---

## Task 6: Settings — Shipping Configuration

> **This eliminates `pnpm run setup-shipping`. No new backend routes needed.**

**Files:** `frontend/src/app/admin/settings/shipping/page.tsx`, `frontend/src/hooks/use-admin-shipping-settings.ts`

### Data layer (all Medusa native, confirmed live)

| Need | Medusa Endpoint |
|---|---|
| List current shipping options | `GET /admin/shipping-options` |
| Create a shipping option | `POST /admin/shipping-options` |
| Delete a shipping option | `DELETE /admin/shipping-options/:id` |
| List stock locations | `GET /admin/stock-locations` |
| List fulfillment providers | `GET /admin/fulfillment-providers` |
| Link provider to location | `POST /admin/stock-locations/:id/fulfillment-providers` |

### `POST /admin/shipping-options` body shape (Medusa v2)
```json
{
  "name": "Standard Shipping",
  "service_zone_id": "<serzo_id>",
  "shipping_profile_id": "<sp_id>",
  "provider_id": "manual_manual",
  "type": { "label": "Standard", "description": "...", "code": "standard" },
  "price_type": "flat",
  "prices": [{ "currency_code": "usd", "amount": 0 }],
  "rules": []
}
```
> **Note:** `service_zone_id` and `shipping_profile_id` must exist first. The page should detect and create these if absent (idempotent setup flow).

### Frontend page

Status checklist section showing each layer (fulfillment set → service zone → shipping options → provider link). If incomplete: "Set Up" button runs the provision flow in sequence. Once set up: table of existing shipping options (name, price, provider) with Add/Delete actions.

- [ ] **Step 6.1:** Create `frontend/src/hooks/use-admin-shipping-settings.ts`
- [ ] **Step 6.2:** Create `frontend/src/app/admin/settings/shipping/page.tsx`

---

## Task 7: Settings — Store & API Keys

> **This eliminates `pnpm run create-publishable-key`. No new backend routes needed.**

**Files:** `frontend/src/app/admin/settings/store/page.tsx`, `frontend/src/hooks/use-admin-store-settings.ts`

### Data layer (all Medusa native, confirmed live)

| Need | Medusa Endpoint |
|---|---|
| List API keys | `GET /admin/api-keys` |
| Create publishable key | `POST /admin/api-keys` with `{ "title": "...", "type": "publishable" }` |
| Revoke API key | `POST /admin/api-keys/:id/revoke` |
| List regions | `GET /admin/regions` |
| Create region | `POST /admin/regions` |

### Frontend page

- **Publishable API Key** card: shows current key (masked `pk_xxxx...xxxx`), "Create New" button
- **Regions** card: table of regions (name, currency) with Add button
- **Sales Channels** card: link sales channel to region

- [ ] **Step 7.1:** Create `frontend/src/hooks/use-admin-store-settings.ts`
- [ ] **Step 7.2:** Create `frontend/src/app/admin/settings/store/page.tsx`

---

## Task 8: Settings Hub

**Files:** `frontend/src/app/admin/settings/page.tsx`

The sidebar already links to `/admin/settings` but there's no page. Create a simple hub with cards linking to each settings sub-page:
- Store & API Keys → `/admin/settings/store`
- Shipping & Fulfillment → `/admin/settings/shipping`
- (Future: Email, Payments, Notifications)

- [ ] **Step 8.1:** Create `frontend/src/app/admin/settings/page.tsx`

---

## Implementation Order

Run tasks in this order to ship incrementally:

```
Task 1 → Task 2 → Task 3   (Dashboard + existing API surfaces = quick wins)
Task 4 → Task 5             (New backend routes needed)
Task 8 → Task 7 → Task 6   (Settings: hub first, then store, then shipping last)
```

Ship Task 6 last because it has the most backend complexity (extracting the fulfillment service).

---

## Deprecation Plan for Scripts (after Task 6 & 7 are complete)

| Script | New Status | Action |
|---|---|---|
| `backend/src/scripts/setup-shipping.ts` | **Legacy fallback** — keep for CI/headless use, add `@deprecated` JSDoc comment |
| `backend/src/scripts/create-publishable-key.ts` | **Legacy fallback** — same |
| `package.json` `setup-shipping` script | Keep but note in README as "for headless/CI only" |

The seed script (`pnpm run seed`) stays as-is — it only bootstraps the admin user, currencies, and sales channel. The admin panel handles everything else post-seed.

---

## Definition of Done

- [ ] Fresh `docker compose up` + `pnpm run seed` → log into `/admin` → click "Set Up Shipping" → checkout works end-to-end, **zero manual scripts**
- [ ] Admin can approve/reject payouts from `/admin/payouts`
- [ ] Admin can manage commission statuses from `/admin/commissions`
- [ ] Admin can see all platform orders from `/admin/orders`
- [ ] Admin can see all buyers from `/admin/users`
- [ ] `/admin/settings` is a real page, not a 404
