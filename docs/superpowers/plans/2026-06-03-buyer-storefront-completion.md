# Buyer Storefront Completion — Phase 1.1

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all remaining gaps in the buyer storefront — both missing critical features, coupon/promo support, and polish items — to bring the Martnex storefront to a production-ready, fully functional state.

**Architecture:** All frontend follows Feature-Sliced conventions (`app/store/` for routes, `components/store/` for UI, `hooks/` for React Query, `lib/api.ts` for fetch helpers). All backend mutations go through Medusa workflows — no direct service calls from route handlers. HTTP methods: GET, POST, DELETE only (no PUT/PATCH).

**Tech Stack:** Medusa v2, Next.js 16.2 App Router, React Query (TanStack), Tailwind CSS v4, TypeScript strict, shadcn/ui, Zod for validation.

---

## What Already Exists (Do Not Recreate)

| Item | Status |
|---|---|
| `frontend/src/app/store/account/orders/page.tsx` | ✅ Order history list with pagination |
| `frontend/src/app/store/orders/[id]/page.tsx` | ✅ Order detail / confirmation page with fulfillment tracker |
| `frontend/src/app/store/account/profile/page.tsx` | ✅ Profile settings + password reset trigger |
| `frontend/src/app/store/account/addresses/page.tsx` | ✅ Address manager |
| `frontend/src/app/store/checkout/page.tsx` | ✅ Full 2-step checkout (address + payment) |
| `frontend/src/components/store/cart/` | ✅ CartItem, CartSummary |
| `frontend/src/components/store/products/` | ✅ ProductCard, QuickAddVariantSelector, VariantSelector, etc. |
| `frontend/src/lib/api.ts` | ✅ All product, customer, address, order fetch helpers |
| `frontend/src/lib/feature-flags.ts` | ✅ `REVIEWS`, `WISHLIST` flags (currently `false`) |

---

## Priority Order

1. **Task 1** — Order Cancel Flow *(missing critical)*
2. **Task 2** — Reorder (Buy Again) *(missing high-value)*
3. **Task 10** — Coupon / Promo Code at Checkout *(missing high-value)*
4. **Task 3** — Real Seller Ratings on Merchant Page *(polish — replaces mock data)*
5. **Task 4** — Footer Newsletter Subscribe *(polish — currently non-functional)*
6. **Task 5** — Account Dashboard: Remove/Replace Fake Savings Index *(cleanup)*
7. **Task 6** — Footer Category Links from Real Data *(polish — currently hardcoded)*
8. **Task 7** — Order Invoice Download *(nice-to-have)*
9. **Task 8** — Merchant Location from Real Seller Metadata *(nice-to-have)*
10. **Task 9** — Product Share Button *(nice-to-have)*

---

## Task 1: Order Cancel Flow

**Priority:** 🔴 Missing Critical

**Files:**
- `frontend/src/app/store/account/orders/page.tsx` — add Cancel button per order
- `frontend/src/app/store/orders/[id]/page.tsx` — add Cancel button on detail page
- `backend/src/api/store/orders/[id]/cancel/route.ts` — new backend route
- `frontend/src/lib/api.ts` — add `cancelOrder()` helper

### Backend

Medusa v2 provides a native `cancelOrder` workflow. The route should:
1. Authenticate the request (require `access_token` from store headers).
2. Verify the order belongs to the current customer (`order.customer_id === customer.id`).
3. Only allow cancellation when `order.status` is `pending` or `placed` (not `shipped`, `completed`, `delivered`).
4. Call the Medusa `cancelOrder` workflow.

```
POST /store/orders/:id/cancel
Auth: Bearer access_token
Response: { order: { id, status } }
```

### Frontend

- Show "Cancel Order" button on the orders list and order detail page only when `order.status === 'pending' || order.status === 'placed'`.
- Use a `<AlertDialog>` (Radix/shadcn) for confirmation before cancelling ("Are you sure? This action cannot be undone.").
- On success, invalidate the `customer-orders-list` and `store-order-confirmation` React Query caches.
- Show a toast: `"Order #${display_id} has been cancelled successfully."`

### Steps

- [ ] **Step 1.1:** Create `backend/src/api/store/orders/[id]/cancel/route.ts` — auth guard, ownership check, status guard, `cancelOrder` workflow call.
- [ ] **Step 1.2:** Register the route in `backend/src/api/middlewares.ts` (add `authenticate("customer", ["bearer", "session"])` for `POST /store/orders/:id/cancel`).
- [ ] **Step 1.3:** Add `cancelOrder(orderId: string, token?: string)` to `frontend/src/lib/api.ts`.
- [ ] **Step 1.4:** Add Cancel button + `<AlertDialog>` confirmation to `frontend/src/app/store/account/orders/page.tsx` — only visible for `pending`/`placed` orders.
- [ ] **Step 1.5:** Add the same Cancel button + dialog to `frontend/src/app/store/orders/[id]/page.tsx`.

---

## Task 2: Reorder (Buy Again)

**Priority:** 🔴 Missing High-Value

**Files:**
- `frontend/src/app/store/account/orders/page.tsx` — add "Buy Again" button per order row
- `frontend/src/app/store/orders/[id]/page.tsx` — add "Buy Again" button per item
- `frontend/src/lib/store/cart-store.ts` — use existing `addItem` action
- `frontend/src/lib/api.ts` — no new backend needed

### Logic

Reorder re-adds each variant from the completed order back into the current cart using the existing `addItem` from `cart-store.ts`. Key rules:
- Use `useCartStore().addItem(variantId, quantity)` for each item.
- Wrap in a `Promise.all` to add all items in parallel.
- Skip any item whose `variant_id` is `null` or `undefined`.
- Show a loading state on the button while running (`isPending`).
- On success: open the cart drawer (`useCartStore().openDrawer()`).
- On failure: show a toast error.

The order object already includes `items[].variant_id`, `items[].quantity` — no new API call needed.

### Steps

- [ ] **Step 2.1:** Add `handleReorder(order: Order)` function to the orders list page — loops `order.items`, calls `addItem` for each, then opens the cart drawer.
- [ ] **Step 2.2:** Add "Buy Again" `<Button>` on `frontend/src/app/store/account/orders/page.tsx` next to the "Track Order" button. Only show for `completed` or `delivered` orders.
- [ ] **Step 2.3:** Add per-item "Add to Cart" button on `frontend/src/app/store/orders/[id]/page.tsx` so buyers can selectively reorder individual items.

---

## Task 3: Real Seller Ratings on Merchant Profile

**Priority:** 🟡 Polish (replaces hardcoded mock data)

**Files:**
- `frontend/src/app/store/merchants/[id]/page.tsx` — replace hardcoded ratings
- `backend/src/api/store/sellers/[id]/route.ts` — check what is returned; extend if needed

### Current Problem

In `frontend/src/app/store/merchants/[id]/page.tsx`, the `ratingValue`, `reviewsCount`, and `ecoRating` are hardcoded strings computed from `seller.business_name.toLowerCase().includes('prodex')`. This is a mock. The `Star Rating` card says "4.7 / 5" but is not real.

### Acceptable Short-Term Fix (before reviews system)

Since the `REVIEWS` feature flag is `false` and a full review system is out of scope:
1. Remove the hardcoded mock rating card entirely, OR
2. Replace it with a neutral "New Merchant" badge that shows `products.length` and `created_at` as trust signals instead of a fake star rating.

The eco-rating card is fine to keep as a visual/design element since it's clearly a design mock, but it should show `N/A` or be omitted rather than a specific fake percentage.

### Steps

- [ ] **Step 3.1:** Remove or neutralize the hardcoded `ratingValue`, `reviewsCount`, and `ecoRating` variables in `frontend/src/app/store/merchants/[id]/page.tsx`.
- [ ] **Step 3.2:** Replace the Seller Rating card with a "Member Since" or "Active Products" trust signal card using real data (`seller.created_at`, `products.length`).
- [ ] **Step 3.3:** Replace the `Portland, Oregon, USA` hardcoded location with `seller.business_email`'s domain or remove the location line entirely until real location data is available in seller metadata.

---

## Task 4: Footer Newsletter Subscribe

**Priority:** 🟡 Polish (non-functional UI element)

**Files:**
- `frontend/src/app/store/layout.tsx` — the footer newsletter input
- `backend/src/api/store/newsletter/route.ts` — new lightweight route (optional: can be a stub)

### Current Problem

The footer in `store/layout.tsx` has an email input and a "Join" button but clicking it does nothing. This is a broken UX — a button that appears interactive but isn't.

### Approach

**Option A (Recommended): Functional stub backend**
Create a minimal `POST /store/newsletter` backend route that:
1. Accepts `{ email }`.
2. Validates with Zod.
3. For now, logs it server-side and returns `{ message: "You're on the list!" }`.
4. (Future: persist to a mailing list table or send to an email marketing service like Mailchimp.)

**Option B (Minimal):** Make it client-side only — on click, just show a success toast with "Thanks! You're on the list." and disable the input. No backend.

Use Option A for a proper implementation.

### Steps

- [ ] **Step 4.1:** Create `backend/src/api/store/newsletter/route.ts` — accepts `{ email }`, validates, logs, returns success JSON.
- [ ] **Step 4.2:** Extract the footer newsletter block into a `NewsletterBlock` client component at `frontend/src/components/store/layout/newsletter-block.tsx`.
- [ ] **Step 4.3:** Wire the `NewsletterBlock` to call `POST /store/newsletter` using `useMutation`. Show loading state on the button and a success/error toast on completion.
- [ ] **Step 4.4:** Replace the raw `<input>` + `<button>` in `store/layout.tsx` with `<NewsletterBlock />`.

---

## Task 5: Remove Fake Savings Index from Account Dashboard

**Priority:** 🟡 Cleanup (misleading mock data)

**Files:**
- `frontend/src/app/store/account/page.tsx`

### Current Problem

The third stat card on the account dashboard shows "Savings Index" computed as `totalOrdersCount * 12.80 + 15.00` — a clearly fake number. There's a `// TODO` comment in the code. Since coupons are deferred, there's no real data to show here.

### Approach

Replace the "Savings Index" card with a more honest stat that has real data:
- **Lifetime Spend** — sum of `order.total` across all orders. This is already available via `data.orders`.
- Or replace with **Account Since** date — show when the customer joined (available from the `user` object or a customer fetch).

### Steps

- [ ] **Step 5.1:** Remove the fake `savingsIndex` calculation from `frontend/src/app/store/account/page.tsx`.
- [ ] **Step 5.2:** Replace the "Savings Index" card with a "Total Spent" stat card — compute `orders.reduce((sum, o) => sum + (o.total || 0), 0)` from the already-fetched order data.
- [ ] **Step 5.3:** Update the card icon and color to match (e.g., `DollarSign` icon with `bg-violet-50` tonal).

---

## Task 6: Footer Category Links from Real Data

**Priority:** 🟡 Polish (currently hardcoded handles)

**Files:**
- `frontend/src/app/store/layout.tsx`

### Current Problem

The "Shop Catalog" footer links use hardcoded category handles (`/store?category=apparel`, `/store?category=electronics`). If category handles change in the database, the links break silently.

### Approach

Since `store/layout.tsx` is a Server Component, fetch the top-level categories at render time and generate the footer links dynamically — the same way `StorePage` fetches them.

> **Performance note:** Use `{ next: { revalidate: 3600 } }` (1 hour) on the fetch so it's cached and doesn't add latency on every page load.

### Steps

- [ ] **Step 6.1:** In `frontend/src/app/store/layout.tsx`, add a `fetchProductCategories()` call at the top of the layout (with `revalidate: 3600`). Limit to top 4 categories for the footer.
- [ ] **Step 6.2:** Map over the categories to generate the footer `<li>` links using real `category.handle` and `category.name`.
- [ ] **Step 6.3:** Add a fallback static array for when the fetch fails (to prevent layout breakage if backend is down).

---

## Task 7: Order Invoice Download

**Priority:** 🟢 Nice-to-Have

**Files:**
- `frontend/src/app/store/account/orders/page.tsx` — add download button per row
- `frontend/src/app/store/orders/[id]/page.tsx` — add download button
- `frontend/src/app/store/orders/[id]/invoice/route.ts` — Next.js Route Handler that generates a PDF or HTML invoice

### Approach

Use a Next.js **Route Handler** (not a page) to generate a printable invoice:
- `GET /store/orders/[id]/invoice` — returns an HTML page styled for print using `@media print` CSS.
- Auth: Pass the `access_token` as a query param or cookie and verify ownership before serving.
- The HTML should include: Martnex logo, order number, date, items table (title, qty, price), subtotal, shipping, total, shipping address.

The "Download Invoice" button triggers `window.open('/store/orders/${order.id}/invoice', '_blank')`.

> **Alternative (simpler):** Use `window.print()` directly on the order detail page by adding a `@media print` stylesheet — no backend needed.

Use the `window.print()` approach as the simpler first implementation.

### Steps

- [ ] **Step 7.1:** Add `@media print` styles to `frontend/src/app/store/orders/[id]/page.tsx` — hide header, footer, nav, confetti, and non-essential elements; format the order detail as a clean invoice.
- [ ] **Step 7.2:** Add a "Print / Save as PDF" `<Button>` on the order detail page that calls `window.print()`. Use `Printer` icon from lucide-react.
- [ ] **Step 7.3:** Add a "Download Invoice" `<Button>` on each row in the orders list page that links to `/store/orders/${order.id}` with a `?print=1` query param. If `print=1`, auto-trigger `window.print()` on mount.

---

## Task 8: Merchant Location from Real Seller Metadata

**Priority:** 🟢 Nice-to-Have

**Files:**
- `frontend/src/app/store/merchants/[id]/page.tsx`
- `backend/src/modules/seller/models/seller.ts` — check for location fields
- `frontend/src/lib/api.ts` — update `SellerProfile` type if new fields are added

### Current Problem

`Portland, Oregon, USA` is hardcoded in the merchant profile page. The `SellerProfile` type does not currently include a `location` or `city` field.

### Approach

1. Check if the `seller` model in `backend/src/modules/seller/models/seller.ts` has location-related fields.
2. If yes: surface those fields via the existing `GET /store/sellers/:id` route and display them.
3. If no: either add a `business_location` field to the seller model (requires a new migration), or simply remove the hardcoded location line — which is the simpler approach and avoids a migration.

> **Recommended shortcut:** Remove the hardcoded `Portland, Oregon, USA` text and replace it with `seller.business_email` (already available), or remove the location line entirely. Adding a new DB field is a larger scope and can be done as part of a "Seller Profile Enrichment" phase later.

### Steps

- [ ] **Step 8.1:** In `frontend/src/app/store/merchants/[id]/page.tsx`, remove the hardcoded `Portland, Oregon, USA` location string from the merchant hero section.
- [ ] **Step 8.2:** Replace it with the seller's `business_email` domain as a location proxy (e.g., extract `@domain.com`) — or simply remove the location row.

---

## Task 9: Product Share Button

**Priority:** 🟢 Nice-to-Have

**Files:**
- `frontend/src/app/store/products/[handle]/product-detail-client.tsx` — add share button

### Approach

Use the browser's native Web Share API (`navigator.share`) with a graceful fallback to copy-to-clipboard.

```typescript
async function handleShare() {
  const url = window.location.href
  if (navigator.share) {
    await navigator.share({ title: product.title, url })
  } else {
    await navigator.clipboard.writeText(url)
    toast.success('Product link copied to clipboard!')
  }
}
```

- Show a `Share2` icon button (from lucide-react) near the product title.
- On mobile where `navigator.share` is supported, this opens the native OS share sheet.
- On desktop, it falls back to clipboard copy.

### Steps

- [ ] **Step 9.1:** Add `handleShare()` function to `product-detail-client.tsx`.
- [ ] **Step 9.2:** Add a `<Button variant="outline">` with `<Share2 />` icon near the product title.
- [ ] **Step 9.3:** Handle the `navigator.share` / clipboard fallback with a success toast.

---

## Task 10: Coupon / Promo Code at Checkout

**Priority:** 🔴 Missing High-Value

**Files:**
- `frontend/src/components/store/cart/coupon-input.tsx` — new component
- `frontend/src/components/store/cart/cart-summary.tsx` — integrate coupon input
- `frontend/src/app/store/checkout/page.tsx` — integrate coupon input in order summary sidebar
- `frontend/src/hooks/use-cart.ts` — add `applyPromotion` and `removePromotion` mutations
- `frontend/src/lib/api.ts` — add `applyCartPromotion()` and `removeCartPromotion()` helpers

### What's Already in Place (Do Not Rebuild)

| Item | Status |
|---|---|
| `Cart.discount_total` | ✅ Already in the `Cart` type in `use-cart.ts` |
| `CartSummary` discount row | ✅ Already renders `{ label: 'Discount', amount: -cart.discount_total }` when `> 0` |
| `medusa.store.cart.addPromotion()` | ✅ Available on the Medusa JS client — no backend route needed |
| `medusa.store.cart.removePromotion()` | ✅ Available on the Medusa JS client — no backend route needed |
| Admin promotions API | ✅ `GET/POST/DELETE /admin/promotions` already live in Medusa |

> **Key insight:** This feature is **frontend-only**. Medusa v2 natively handles promo codes via its cart endpoints. Admins create promotion codes via `/admin/promotions` (already covered in the Admin Panel plan). The buyer storefront just needs the UI to submit a code and call the Medusa cart API.

### Medusa Cart Promotion API

```
# Apply a promo code to the cart
POST /store/carts/:id/promotions
Body: { promo_codes: ["SUMMER20"] }
Response: { cart: { ... discount_total: 20.00, ... } }

# Remove a promo code from the cart
DELETE /store/carts/:id/promotions
Body: { promo_codes: ["SUMMER20"] }
Response: { cart: { ... discount_total: 0, ... } }
```

Both are called via the Medusa JS SDK:
```typescript
await medusa.store.cart.addPromotion(cartId, { promo_codes: [code] }, {}, headers)
await medusa.store.cart.removePromotion(cartId, { promo_codes: [code] }, {}, headers)
```

### Cart Type Extension

Extend the `Cart` interface in `use-cart.ts` to include applied promotions:
```typescript
export interface Cart {
  // ... existing fields ...
  discount_total: number
  promotions?: { code: string }[]  // Add this
}
```

### CouponInput Component

Create `frontend/src/components/store/cart/coupon-input.tsx`:
- An inline input field + "Apply" button row.
- Shows current applied code as a removable chip/badge below the input if `cart.promotions?.length > 0`.
- Shows loading state while the mutation is pending.
- Shows error message inline (not just a toast) if the code is invalid.
- On success: the `CartSummary` discount row auto-updates since `cart.discount_total` comes from the React Query cache.

**UX Spec:**
```
[ Promo Code          ] [ Apply ]
  ✓ SUMMER20 applied — $20.00 off  [×]
```

When a valid code is applied:
- Show a green `toast.success('Promo code applied!')` 
- Show the applied code as a removable chip
- The discount row in `CartSummary` updates automatically via the invalidated cart cache

When an invalid code is entered:
- Show inline error text in red below the input (do NOT navigate away)
- `toast.error('Invalid or expired promo code')`

### Steps

- [ ] **Step 10.1:** Add `applyPromotion` and `removePromotion` mutations to `frontend/src/hooks/use-cart.ts`:
  ```typescript
  const applyPromotion = useMutation({
    mutationFn: async (code: string) => {
      const id = getStoredCartId()
      if (!id) throw new Error('No active cart')
      const headers = await buildStoreHeaders()
      const data = await medusa.store.cart.addPromotion(id, { promo_codes: [code] }, {}, headers)
      return normalizeCart(data.cart as unknown as Cart)
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const removePromotion = useMutation({
    mutationFn: async (code: string) => {
      const id = getStoredCartId()
      if (!id) throw new Error('No active cart')
      const headers = await buildStoreHeaders()
      const data = await medusa.store.cart.removePromotion(id, { promo_codes: [code] }, {}, headers)
      return normalizeCart(data.cart as unknown as Cart)
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', updatedCart.id], updatedCart)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })
  ```
  Also add `promotions?: { code: string }[]` to the `Cart` interface and pass `applyPromotion` / `removePromotion` from the hook's return value.

- [ ] **Step 10.2:** Create `frontend/src/components/store/cart/coupon-input.tsx` — the self-contained promo code UI component. Props: `cart: Cart`, `applyPromotion: UseMutationResult`, `removePromotion: UseMutationResult`.

- [ ] **Step 10.3:** Integrate `<CouponInput>` into `frontend/src/components/store/cart/cart-summary.tsx` — place it between the items list and the totals divider. Pass down `cart`, `applyPromotion`, and `removePromotion` as props (sourced from `useCart()` at the parent).

- [ ] **Step 10.4:** Update `frontend/src/app/store/cart/page.tsx` to destructure `applyPromotion` and `removePromotion` from `useCart()` and pass them down to `<CartSummary>`.

- [ ] **Step 10.5:** Integrate `<CouponInput>` into the checkout page order summary sidebar (`frontend/src/app/store/checkout/page.tsx`) — place it in the desktop Order Summary card (`.hidden.md:block`) above the totals section. Same pattern: pass `cart`, `applyPromotion`, `removePromotion` from `useCart()`.

- [ ] **Step 10.6:** Also integrate `<CouponInput>` into the mobile collapsible accordion order summary in `checkout/page.tsx` — so mobile users can also apply codes before paying.

- [ ] **Step 10.7:** Verify the discount row in `CartSummary` correctly shows after applying a code (it already renders when `cart.discount_total > 0` — just verify the cart cache update triggers a re-render).

---

## Summary Table

| Task | Feature | Priority | Backend? | Frontend? |
|---|---|---|---|---|
| 1 | Order Cancel Flow | 🔴 Critical | ✅ New route | ✅ AlertDialog + button |
| 2 | Reorder / Buy Again | 🔴 High Value | ❌ None | ✅ Uses existing cart store |
| 10 | Coupon / Promo Code | 🔴 High Value | ❌ None (Medusa native) | ✅ CouponInput component |
| 3 | Real Seller Ratings | 🟡 Polish | ❌ None | ✅ Remove mocks |
| 4 | Newsletter Subscribe | 🟡 Polish | ✅ Stub route | ✅ New NewsletterBlock |
| 5 | Remove Fake Savings Index | 🟡 Cleanup | ❌ None | ✅ Replace with Total Spent |
| 6 | Footer Real Category Links | 🟡 Polish | ❌ None | ✅ Fetch in layout |
| 7 | Order Invoice / Print | 🟢 Nice-to-Have | ❌ None | ✅ window.print() |
| 8 | Merchant Real Location | 🟢 Nice-to-Have | ❌ None | ✅ Remove hardcode |
| 9 | Product Share Button | 🟢 Nice-to-Have | ❌ None | ✅ Web Share API |

---

## Aesthetic & UX Standards Reminder

All new UI must follow the Martnex Design System (`design-system/MASTER.md`):
- **No hardcoded light-only colors.** Use `bg-white text-slate-900` (auto-inverts in dark) or CSS var tokens (`bg-card`, `text-foreground`).
- **AlertDialogs** must use Radix/shadcn `<AlertDialog>` primitive — not `window.confirm()`.
- **Loading states** on all mutation buttons (`disabled={isPending}` + spinner or text change).
- **Toasts** via `sonner` — `toast.success()`, `toast.error()`, `toast.info()`.
- **Button variants:** Use `variant="outline"` for secondary actions, `variant="default"` (black) for primary destructive-confirm.
- **Rounded corners:** `rounded-2xl` for buttons, `rounded-3xl` for cards.
- **Dark Mode:** Every new component must support dark mode. Use `dark:` variants or auto-inverting palette classes.
