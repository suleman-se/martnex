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
- **Typography:** Use modern pairings (e.g., Inter, Roboto) via Google Fonts.
- **Micro-animations:** Add subtle hover effects and transitions to make the UI feel "alive".
- **Glassmorphism & Gradients:** Use modern effects where appropriate for a high-end feel.
- **No Placeholders:** Use realistic mock data or generated images for demos.
- **Dark Mode:** All UI components MUST support dark mode using Tailwind `dark:` variants. Never use hardcoded light-only colors (`bg-white`, `text-gray-900`, etc.) without a `dark:` counterpart. Use the CSS variable system defined in `globals.css` (e.g., `bg-card`, `text-foreground`) wherever possible.

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
│   │   ├── forms/    # <FormError />, <SubmitButton />, <AuthFeedbackPanel />
│   │   ├── guards/   # <ProtectedRoute /> — use this everywhere
│   │   ├── layouts/  # <BaseDashboardLayout />
│   │   ├── loading/  # <LoadingSpinner />, <SkeletonRow />
│   │   └── typography/ # <PageHeader />, <SectionTitle />
│   ├── store/        # Buyer storefront UI
│   │   ├── layout/   # StoreHeader (sticky nav, search, cart badge), MobileNavbar (bottom)
│   │   ├── products/ # ProductCard, ProductGrid, VariantSelector
│   │   ├── cart/     # CartItemRow, CartSummary
│   │   ├── account/  # AddressCard, AddressEditorCard, DeleteAddressDialog, SavedAddressSelector
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

**7. Button Variants — Dark Mode Aware:**
All `<Button>` variants in `src/components/ui/button.tsx` support both modes:
- `default`: black bg / white text → white bg / black text in dark
- `premium`: dark gradient → light gradient in dark
- `outline`: slate-200 border → slate-700 border in dark
- `tonal`: slate-100 surface → slate-800 surface in dark
- `ghost`: subtle slate hover → dark slate hover in dark
- `secondary`/`destructive`/`link`: driven by CSS vars (auto-adapt)

**8. Responsive Breakpoints (Storefront):**
- Mobile: `< 768px` — MobileNavbar (bottom bar) visible; StoreHeader hides desktop nav.
- Tablet: `768px–1023px` — MobileNavbar visible; compact icon sidebar in account area.
- Desktop: `≥ 1024px` — full StoreHeader nav; full sidebar in account area.
- **Key rule:** Use `lg:` (1024px) as the mobile→desktop flip point, not `md:`.

## 8. Backend Architecture
- **Medusa v2** with custom modules and workflows.
- **Module Links:** Extensive use of link modules (e.g., `seller-product`) to extend core Medusa entities.
- **Auth:** Custom token endpoints in `/store/auth` using `generateJwtToken`. `refreshUser()` in `auth-store.ts` silently calls `refreshSession()` on 401 before logging out (access token = 1-day TTL, refresh token = 7-day TTL in Redis).
- **Roles:** User roles are synchronized between `auth_identity` and the business logic layer.
- **Seller Product API:** Seller product create/update routes normalize frontend-friendly payloads into Medusa core workflow inputs.
- **File Storage:** Local file uploads are served from `/static` via the Medusa file module; seller uploads use `/store/uploads` and `/store/uploads/:id`.
- **Redis:** Mandatory for production-like environments (via `Modules.CACHE`).
- **Fulfillment Infrastructure:** Must be provisioned once via `pnpm run setup-shipping`. Creates: Default Fulfillment Set → Worldwide service zone → Standard ($0) + Express ($9.99) shipping options. Idempotent — safe to re-run.
- **Shipping Profile Requirement:** Every product MUST have a row in `product_shipping_profile` or checkout fails. Seed Step 8 repairs missing links; `create-seller-product.ts` enforces this for new products.
- **Inventory Requirement:** Every variant MUST have a `product_variant_inventory_item` link AND an `inventory_level` with `stocked_quantity > 0`.

## 9. Storefront Patterns (Buyer)

- **Cart persistence:** Cart ID stored as `martnex_cart_id` in `localStorage`. Always call `clearStoredCartId()` after a successful order.
- **Lazy cart creation:** `addItem` creates the cart on first use. Requires a `regionId` — obtain via `useRegions().defaultRegion?.id`.
- **PaymentStep architecture:** `PaymentStep` renders `CodOnlyPaymentStep` when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is absent, or Stripe Elements when key is present.
- **Checkout prerequisite chain:** Product linked to sales channel → variant has inventory link → `stocked_quantity > 0` → stock location linked to sales channel → fulfillment set + shipping options exist → product has `product_shipping_profile` row.
- **Store routes:** All `/store/*` pages share `app/store/layout.tsx` (StoreHeader + footer). Search and category filter are URL-param driven (`?q=`, `?category=`) for SSR-friendliness.
- **Prices NOT in cents** (project-wide rule — `$29.99` stored and displayed as `29.99`).
- **Spotlight Search:** Keydown hotkeys (`⌘K`, `Ctrl+K`, `/`) toggle command palette. Guard against input/textarea focus before capturing. Search history must be initialized in `useEffect` to avoid SSR hydration mismatch.
- **Buyer Account Portal:** `/store/account` layout uses a sticky `md:w-16 lg:w-64` icon/full sidebar. All account sub-pages use componentized sub-components (`AddressCard`, `AddressEditorCard`, `DeleteAddressDialog`, `SavedAddressSelector`) with centralized types from `src/types/address.ts`.
- **Auth Screens:** All auth pages (`/login`, `/register`, `/forgot-password`, etc.) support dark mode. Background uses explicit `dark:bg-[#090d16]`. `AuthContainer` card uses `dark:border-slate-700/40`. All feedback panels (`AuthFeedbackPanel`, inline banners) have `dark:` color variants.
- **Skeletonizer:** `.skeleton-auto` CSS utility shimmers any React tree without static layout shifts.

## 10. Architecture Notes & Known Constraints
- **Multi-product per seller:** Use Knex raw SQL (`INSERT … ON CONFLICT DO NOTHING`) to insert into pivot tables. Do NOT set `isList: true` on `defineLink` — crashes MikroORM in cross-module contexts (Medusa 2.13.x limitation).
- **Prices are stored as dollars (not cents).** Never multiply or divide by 100 for display.
- **HTTP methods:** Medusa v2 only supports GET, POST, DELETE on store routes. Use POST for updates (no PUT/PATCH).
- **Workflows required for ALL mutations** — never call module services directly from route handlers.

## 11. Completed Milestones
- **Refactoring Phase 1:** Monolith to Feature-Sliced migration — **COMPLETE ✅**
- **Auth Persistence:** Refresh token rotation via Redis — **COMPLETE ✅**
- **Seller Onboarding:** Multi-step verification flow — **COMPLETE ✅**
- **Seller Product Management:** Shopify-style CRUD with normalized variants, `/static` media URLs, deferred image deletion, multi-product support via Knex pivot — **COMPLETE ✅**
- **Role Sync:** JWT role synchronization across services — **COMPLETE ✅**
- **Dashboard Layouts:** Standardized `<BaseDashboardLayout>` across platform — **COMPLETE ✅**
- **Client Call Deduping:** Publishable key and customer refresh requests use single-flight caching — **COMPLETE ✅**
- **Seller Order Fulfillment:** Live orders dashboard, scoped order APIs, auto-commission on `order.placed` — **COMPLETE ✅** _(v0.5.0)_
- **Seller Dashboard & Payouts:** Order detail page, real-data dashboard stats, payouts history, 17 route unit tests — **COMPLETE ✅** _(v0.6.0)_
- **Buyer Storefront:** Product browse/search, product detail + variant selector, persistent cart, 2-step checkout (Stripe + COD), order confirmation — **COMPLETE ✅** _(v0.7.0)_
- **Checkout Stability & Infrastructure Hardening:** Payment-step bug fixes, fulfillment stack automation, inventory/shipping-profile enforcement, auth silent token refresh — **COMPLETE ✅** _(v0.7.1)_
- **Storefront UI/UX Premium Revamp:** Scrolly header, autocomplete, side-cart drawer, shipping meter, quick-add variants, Stripe focus styling, confetti receipt — **COMPLETE ✅** _(v0.8.0)_
- **Premium Spotlight Search & Mega-Menus:** Category mega-menus, global spotlight overlay (⌘K), search history, spring-bounce cart animations — **COMPLETE ✅** _(v0.8.5)_
- **Premium Mobile Storefront:** Sticky bottom nav, full-screen category drawer, touch Quick Add, native sticky Buy Bar, collapsible checkout accordion — **COMPLETE ✅** _(v0.9.0)_
- **Storefront Skeletons, Carousels & Brand Profiles:** Pulse-shimmer skeletons, parallax heroes, recommendation carousels, brand storefront routes, dark mode — **COMPLETE ✅** _(v0.9.5)_
- **Address Manager & Checkout Selector:** Unified address types, sole-default constraints, Radix delete dialogs, saved address selector at checkout, scroll locking — **COMPLETE ✅** _(v0.9.8)_
- **Tablet Responsiveness (Account Area):** Compact icon sidebar on tablet, sticky aside, correct `md:flex-row` outer container, inner grids shifted to `lg:` breakpoints — **COMPLETE ✅** _(v0.9.9)_
- **Auth Screen Dark Mode:** Dark backgrounds, dark card borders, dark feedback panels (error/success/warning) across all auth forms and layouts — **COMPLETE ✅** _(v0.9.9)_
- **Button Variant Dark Mode:** All 7 button variants (`default`, `premium`, `outline`, `tonal`, `ghost`, `secondary`, `destructive`) now explicitly support `dark:` Tailwind classes — **COMPLETE ✅** _(v0.9.9)_
