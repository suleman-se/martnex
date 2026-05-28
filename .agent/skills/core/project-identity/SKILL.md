---
name: project-identity
description: Load automatically for ALL Martnex development tasks to understand project philosophy, global rules, and AI assistant standards. This is the source of truth for Martnex project identity.
---

# Martnex Project Identity & Global Standards

This skill defines the high-level philosophy, core rules, and standards for the Martnex project.

## 1. Project Philosophy
- **Side Project Context:** This is an incrementally built project.
- **No Timeline Pressure:** Focus on small, working increments and shipping early/often.
- **Simplicity First:** Prefer readable, standard code over complex optimizations or over-engineering.
- **Superpowers Mindset:** Every feature should feel "premium" and "high-end". Avoid generic AI-generated looks.

## 2. Core Identity
- **Martnex:** An open-source multi-vendor marketplace built on Medusa.js (v2) and Next.js (v16).
- **Three Core Roles:** 
  1. **Buyer:** Browse, purchase, review products.
  2. **Seller:** Manage products, track earnings, request payouts.
  3. **Admin:** Manage platform, approve sellers, resolve disputes.

## 3. Global Technical Hard Rules (REQUIRED)
- **Package Manager:** **pnpm 10+ only.** Never use npm or yarn.
- **Dependencies:** ALWAYS use the latest versions (`pnpm add <pkg>@latest`). Verify latest version with `npm view <pkg> version` first.
- **TypeScript:** Strict mode is mandatory. Avoid `any` types at all costs. Use Zod for runtime validation.
- **Database:** Medusa v2 uses **MikroORM** and DML (Data Model Language).
- **Styling:** **Tailwind CSS v4** is the primary styling engine. Use Vanilla CSS only when necessary for complex animations.
- **E2E Testing:** Playwright is used in the `frontend` directory (`pnpm playwright test`).
- **React 19:** This project uses React 19. In new components, pass `ref` as a regular prop (no `forwardRef` needed). `shadcn/ui` primitives still use `forwardRef` for Radix compatibility — this is expected and acceptable.
- **Next.js 16.2:** App Router only. `proxy.ts` (was `middleware.ts`). `cookies()`/`headers()` are async. `params`/`searchParams` are async Promises — always `await` them.
- **Docker Server Components:** Next.js Server Components running in Docker MUST use `MEDUSA_BACKEND_URL: http://backend:9001` to resolve the Medusa API. `NEXT_PUBLIC_MEDUSA_BACKEND_URL` pointing to `localhost` is strictly for client-side browser API calls.

## 4. AI Assistant Standards (How to Work)
- **Concise & Actionable:** Skip pleasantries; get to the code and solution.
- **Show, Don't Tell:** Provide code examples rather than long theoretical explanations.
- **Flag Risks:** Proactively warn about breaking changes, security vulnerabilities, or complex migrations.
- **Reuse Before Create:** ALWAYS reuse existing shared/common components before creating new ones. Search `src/components/shared`, `src/components/ui`, and existing domain component folders first.
- **"Fixed" Convention:** 
  - Use "Fixed" only for bugs discovered in already merged/released code.
  - Corrections during active development are part of implementation, not "fixes."

## 5. Aesthetics & UX Standards (PREMIUM ONLY)
- **Visual Excellence:** Implement designs that WOW the user. Use curated color palettes (no generic red/blue).
- **Typography:** Use modern pairings (e.g., Inter, Roboto, or Outfit) via Google Fonts.
- **Micro-animations:** Add subtle hover effects and transitions to make the UI feel "alive".
- **Glassmorphism & Gradients:** Use modern effects where appropriate for a high-end feel.
- **No Placeholders:** Use realistic mock data or generated images for demos.

## 6. Security Principles
- No hardcoded secrets (use `.env`).
- Validate all inputs with **Zod**.
- Security-first mindset: validate inputs, sanitize outputs, follow OWASP guidelines.

## 7. Frontend Architecture (Feature-Sliced)

The Next.js frontend uses a strict feature-sliced architecture. **Do not revert to monolithic patterns.**

### Directory Convention
```
src/
├── app/              # Route files ONLY — no business logic, no inline API calls
├── components/
│   ├── admin/        # Admin-domain UI (admin-sidebar, admin-header)
│   ├── seller/       # Seller-domain UI
│   │   ├── layout/   # SellerSidebar, SellerHeader, VerificationBanners
│   │   ├── dashboard/# StatCard, StatsGrid, SalesChartPlaceholder, ActivityFeed
│   │   ├── onboarding/ # Step form components + Zod schema module
│   │   └── products/ # Product management (ProductForm, VariantBuilder, ImageUpload, ProductsTable)
│   ├── auth/         # Auth form components (LoginForm, RegisterForm, etc.)
│   ├── shared/
│   │   ├── controls/ # <CopyButton />, <SortSelect />
│   │   ├── empty-states/ # <EmptyState />
│   │   ├── forms/    # <FormError />, <SubmitButton />
│   │   ├── guards/   # <ProtectedRoute /> — use this everywhere
│   │   ├── layouts/  # <BaseDashboardLayout />
│   │   ├── loading/  # <LoadingSpinner />, <SkeletonRow />
│   │   └── typography/ # <PageHeader />, <SectionTitle />
│   ├── store/        # Buyer storefront UI
│   │   ├── layout/   # StoreHeader (sticky nav, search, cart badge)
│   │   ├── products/ # ProductCard, ProductGrid, VariantSelector
│   │   ├── cart/     # CartItemRow, CartSummary
│   │   └── checkout/ # AddressForm, PaymentStep (Stripe Elements + COD)
│   └── ui/           # shadcn/ui primitives only
└── hooks/            # Data fetching with React Query (staleTime: 30s-5min)
```

### Critical Patterns to Follow

**0. Component Reuse Policy — REQUIRED:**
- Do NOT recreate components that already exist in `src/components/shared` or `src/components/ui`.
- If the same UI pattern appears in 2+ places, extract/refactor to a common component instead of duplicating.
- Place cross-domain reusable building blocks in `src/components/shared`.
- Keep domain wrappers thin (`admin/`, `seller/`, `store/`) and compose shared/common components.

**1. Hydration — ALWAYS use `mounted` pattern:**
```ts
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <LoadingScreen />;
```

**2. Form Layouts — Two-Column "Shopify-style":**
- Use a main column for primary content (title, description, images).
- Use a sidebar column for secondary settings (category, status, tags).
- Use a sticky footer/header for primary actions (Save, Cancel).

**3. Data Fetching — ALWAYS use React Query hooks:**
```ts
const { products, isLoading } = useSellerProducts();
```

**4. Seller Media Lifecycle — Upload early, delete late:**
- Upload product images immediately for preview.
- Persist `images[].metadata.file_id` in form state.
- Queue removals in `pending_delete_file_ids` and physically delete files only after a successful product save.
- Normalize backend-served media to `/static/...` URLs before rendering.

**5. Component Internal Structure — Use shadcn/ui primitives:**
- Prefer `<Card>`, `<Button>`, `<Input>` from `@/components/ui`.

**6. Dashboard Shells — Use `<BaseDashboardLayout />`:**
- Universal shell for Admin and Seller dashboards to ensure layout consistency.

## 8. Backend Architecture
- **Medusa v2** with custom modules and workflows.
- **Module Links:** Extensive use of link modules (e.g., `seller-product`) to extend core Medusa entities.
- **Auth:** Custom token endpoints in `/store/auth` using `generateJwtToken`. `refreshUser()` in `auth-store.ts` silently calls `refreshSession()` on 401 before logging out (access token = 1-day TTL, refresh token = 7-day TTL in Redis).
- **Roles:** User roles are synchronized between `auth_identity` and the business logic layer.
- **Seller Product API:** Seller product create/update routes normalize frontend-friendly payloads into Medusa core workflow inputs.
- **File Storage:** Local file uploads are served from `/static` via the Medusa file module; seller uploads use `/store/uploads` and `/store/uploads/:id`.
- **Redis:** Mandatory for production-like environments (via `Modules.CACHE`).
- **Fulfillment Infrastructure:** Must be provisioned once via `pnpm run setup-shipping` (script: `backend/src/scripts/setup-shipping.ts`). Creates: Default Fulfillment Set → Worldwide service zone → Standard ($0) + Express ($9.99) shipping options + `manual_manual` provider linked to stock location. Idempotent — safe to re-run. Without this, checkout shows "No shipping options available".
- **Shipping Profile Requirement:** Every product MUST have a row in `product_shipping_profile` or checkout fails with "shipping profiles not satisfied". Seed Step 8 repairs missing links on every run; `create-seller-product.ts` workflow enforces this for new products via `linkProductToShippingProfileStep`.
- **Inventory Requirement:** Every variant MUST have a `product_variant_inventory_item` link AND an `inventory_level` with `stocked_quantity > 0`. Seed repairs missing links and levels; seller product workflow enforces this for new products.

## 9. Storefront Patterns (Buyer — v0.7.0+)

- **Cart persistence:** Cart ID stored as `martnex_cart_id` in `localStorage`. `getStoredCartId()` / `setStoredCartId()` / `clearStoredCartId()` are all exported from `use-cart.ts`. Always call `clearStoredCartId()` after a successful order completion.
- **Lazy cart creation:** `addItem` creates the cart on first use if no cart ID exists. Requires a `regionId` — obtain via `useRegions().defaultRegion?.id`.
- **PaymentStep architecture (v0.7.1):** `PaymentStep` is the exported entry point. Renders `CodOnlyPaymentStep` when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is absent, or `<Elements><PaymentStepWithStripe></Elements>` when key is present. Both share `MethodCard` (radio-style provider card) and `PlaceOrderButton` (spinner + step label). Method card click ONLY selects provider — never triggers submission. `handlePlaceOrder` ALWAYS calls `ensureShipping()` first before any payment operation.
- **Stripe payment flow:** Provider ID = `pp_stripe_stripe`. Client secret lives in `cart.payment_collection.payment_sessions[n].data.client_secret`. Only rendered when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set.
- **COD payment flow:** Provider ID = `pp_system_default`. No card entry — call `initPayment` then `completeOrder` directly.
- **Checkout prerequisite chain:** For shipping options to appear at checkout, ALL of these must be true: (1) product linked to sales channel, (2) variant has `product_variant_inventory_item` link, (3) inventory level has `stocked_quantity > 0`, (4) stock location linked to sales channel, (5) `manual_manual` provider linked to stock location, (6) fulfillment set + service zone + shipping options exist (`pnpm run setup-shipping`), (7) product has a row in `product_shipping_profile`.
- **Store routes:** All `/store/*` pages share the `app/store/layout.tsx` shell (StoreHeader + footer). Search and category filter are URL-param driven (`?q=`, `?category=`) for SSR-friendliness and linkability.
- **Prices NOT in cents** (project-wide rule — `$29.99` stored and displayed as `29.99`).
- **Immersive Spotlight Search (v0.8.5):** Keydown hotkeys (`⌘K`, `Ctrl+K`, `/`) globally toggle the command palette overlay. The event handler must check if the active element is an input, textarea, or contenteditable element before capturing hotkeys to prevent keydown hijacking. Initializing search history state from `localStorage` must be wrapped in a client-side `useEffect` callback to avoid SSR/CSR hydration mismatches.
- **Dynamic Multi-Vendor Policy Accordions & Trust Badges via Medusa Product Metadata (Future Standard):** To support vendor-specific shipping, sourcing, and sizing details dynamically without bloated database schemas, leverage Medusa v2's flexible `metadata` field on the product object. Custom JSON schemas like `{"shipping_info": "...", "sourcing_info": "...", "fit_info": "..."}` can be set per-product. The storefront should check for these override keys inside `product.metadata` and seamlessly fall back to premium, curated platform-wide defaults when undefined.

## 10. Architecture Notes & Known Constraints
- **Multi-product per seller:** Medusa's `createRemoteLinkStep` enforces a 1:1 application-level constraint on module links. Use Knex raw SQL (`INSERT … ON CONFLICT DO NOTHING`) to insert into the pivot table directly. Do NOT set `isList: true` on `defineLink` — it crashes MikroORM's `expandDotPaths` in cross-module contexts (Medusa 2.13.x limitation).
- **Prices are stored as dollars (not cents).** Never multiply or divide by 100 for display.
- **HTTP methods:** Medusa v2 only supports GET, POST, DELETE on store routes. Use POST for updates (no PUT/PATCH).
- **Workflows required for ALL mutations** — never call module services directly from route handlers.

## 10. Completed Milestones
- **Refactoring Phase 1:** Monolith to Feature-Sliced migration — **COMPLETE ✅**
- **Auth Persistence:** Refresh token rotation via Redis — **COMPLETE ✅**
- **Seller Onboarding:** Multi-step verification flow — **COMPLETE ✅**
- **Seller Product Management:** Shopify-style CRUD with normalized variants, `/static` media URLs, deferred image deletion, multi-product support via Knex pivot — **COMPLETE ✅**
- **Role Sync:** JWT role synchronization across services — **COMPLETE ✅**
- **Dashboard Layouts:** Standardized `<BaseDashboardLayout>` across platform — **COMPLETE ✅**
- **Client Call Deduping:** Publishable key and customer refresh requests use single-flight caching — **COMPLETE ✅**
- **Seller Order Fulfillment:** Live orders dashboard (`/seller/orders`), scoped order APIs, auto-commission on `order.placed` — **COMPLETE ✅** _(v0.5.0, 13 May 2026)_
- **Seller Dashboard & Payouts:** Order detail page, real-data dashboard stats, payouts history page, 17 route unit tests — **COMPLETE ✅** _(v0.6.0, 18 May 2026)_
- **Buyer Storefront:** Product browse/search, product detail + variant selector, persistent cart, 2-step checkout (Stripe Elements + COD), order confirmation — **COMPLETE ✅** _(v0.7.0, 19 May 2026)_
- **Checkout Stability & Infrastructure Hardening:** 3 payment-step bugs fixed; fulfillment stack automated via `setup-shipping` script; inventory/shipping-profile links enforced in seed + seller product workflow; auth silent token refresh on expiry — **COMPLETE ✅** _(v0.7.1, 20 May 2026)_
- **Storefront UI/UX Premium Revamp (Phase 2):** Scrolly header & autocomplete, slide-over side-cart drawer, currency-aware progress shipping meter, dynamic quick add variants, custom-styled Stripe focus boundaries, transaction processing stepper states, particle confetti successfully mounted on order receipt — **COMPLETE ✅** _(v0.8.0, 21 May 2026)_
- **Premium Spotlight Search, Mega-Menus & Inventory Resolution (Phase 5):** Interactive category mega-menus with hover-leave delays, global immersive spotlight overlay (⌘K, Ctrl+K, `/`), client-cached search history, spring-bounce cart micro-animations, stock image product catalog seeding, variant price fixtures, and order place inventory decrement mapping resolution — **COMPLETE ✅** _(v0.8.5, 21 May 2026)_
- **Premium Mobile Storefront Responsiveness & Native-App UX (Phase 6):** App-like sticky bottom navigation bar, full-screen slide-up mobile category explore drawer sheet, responsive spotlight search command overlay stacked vertically, 2-column e-commerce product catalog grids with persistent touch Quick Add buttons, mobile-native sticky bottom purchase Buy Bar, and collapsible top checkout summary accordion — **COMPLETE ✅** _(v0.9.0, 25 May 2026)_
- **Premium Storefront Skeletons, Editorial Landing Pages, Snap Carousels, & Brand Storefront Profiles (Phase F):** Pulse-shimmer loading skeletons, parallax visual heroes, recommended touch carousels with 1-click adds, dynamic brand storefront route segments (`/store/merchants/[id]`), cursor-pointer variant hovers, and premium HSL-inverted obsidian dark mode compatibility — **COMPLETE ✅** _(v0.9.5, 25 May 2026)_

## 11. Next Phase — Admin Panel (Phase 7) ⬅️ START HERE

> **Plan file:** `docs/superpowers/plans/2026-05-20-admin-panel.md`

The admin panel is the **immediate next task**. Do not start buyer account area, reviews, or other features until this is shipped.

**Goal:** After this phase a fresh install needs only `pnpm run seed` + logging into `/admin` — zero manual scripts.

**Key architecture fact:** Medusa's native `/admin/*` API is fully live and accepts a Bearer token from `POST /auth/user/emailpass`. Most admin pages are **frontend-only** — no new backend routes needed.

| Task | Page | What it replaces / adds |
|---|---|---|
| 1 | `/admin` dashboard | Blank shell → real stats |
| 2 | `/admin/commissions` | API exists, UI missing |
| 3 | `/admin/payouts` | API exists, UI missing |
| 4 | `/admin/orders` | Uses `GET /admin/orders` (Medusa native) |
| 5 | `/admin/users` | Uses `GET /admin/customers` (Medusa native) |
| 6 | `/admin/settings/shipping` | Replaces `pnpm run setup-shipping` |
| 7 | `/admin/settings/store` | Replaces `pnpm run create-publishable-key` |
| 8 | `/admin/settings` hub | 404 → real page |

**Admin auth:** `POST /auth/user/emailpass` → Bearer token. Works on all `/admin/*` routes including custom Martnex ones (`authenticate("user", ["session", "bearer"])`).

**What already exists:** `/admin` layout + shell, `AdminSidebar`, `AdminHeader`, `/admin/sellers` page, backend routes for sellers/commissions/payouts.
