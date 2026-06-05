# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

> **Next phase — Phase 7: Admin Panel** (`docs/superpowers/plans/2026-05-20-admin-panel.md`)
> Builds the full in-app admin dashboard so no manual scripts are needed after a fresh install.
> Covers: admin dashboard stats, commissions UI, payouts UI, orders view, users view, shipping settings (replaces `pnpm run setup-shipping`), store settings / API key management (replaces `pnpm run create-publishable-key`).
> Most pages are frontend-only — Medusa's native `/admin/*` API is used directly with an admin Bearer token.
> After this phase: `pnpm run seed` → login to `/admin` → click "Set Up Shipping" → done. Zero manual scripts.

> Future (post-Phase 7): Product reviews, seller fulfillment actions.

---

## [0.9.8] - Strict Type-Safe Buyer Account Portal & Responsive Layout Refinements (1 June 2026)

### Added
- **Centralized Address Models**: Created unified TypeScript interfaces (`AddressInput`, `CustomerAddress`, `CustomerProfile`) at `src/types/address.ts` to govern all buyer account forms, checkout saved selectors, and API endpoints, fully preventing `any` typed fields.
- **Modular Addresses Dashboard**: Simplified the monolithic profile addresses managers by modularizing form, card, and alert layers into isolated components: `<AddressCard />`, `<AddressEditorCard />`, and `<DeleteAddressDialog />`.
- **Checkout Saved Address Selector**: Created a dynamic, touch-friendly saved address grid at checkout (`<SavedAddressSelector />`) that automatically checks for defaults, handles email sync, and includes a fallback toggle for custom ad-hoc addresses.
- **Centralized Scrolling Lock**: Created custom React hook `useBodyScrollLock(isOpen)` to handle body element overlays and backdrop locks on mobile drawer pages.
- **TODO on Mocked Data**: Injected persistent `TODO` blocks on mock calculations (e.g., Simulated Savings Index multiplier formula) within the buyer's account overview route.

### Changed
- **Optimized Mobile & Tablet Header Spacing**: Adjusted the `StoreHeader` layout to dynamically hide text-heavy capsule buttons like "Sign In" or "Hi, [Name]" on screens below `lg` (1024px) threshold, freeing up significant horizontal width. Extended the mobile hamburger menu toggle to display on tablets as well.
- **Unified Mobile & Tablet Touch Experience**: Shifted the sticky bottom navbar (`MobileNavbar`) and float-bar purchase widgets to display on both mobile and tablet viewports (screens below `lg` threshold), creating a cohesive touch navigation ecosystem. Adjusted safe footer padding across all touch breakpoints.
- **Always-Visible Bottom Navbar**: Boosted the bottom navigation bar layering index to `z-50` to guarantee absolute layering above all background viewport overlays.
- **Tablet Touch Quick Add Integration**: Extended the responsive touch Quick Add triggers in `<ProductCard />` to tablet screens, replacing desktop-hover animations with clean, tap-to-select variant overlays.
- **Responsive Padding & Gaps**: Resized headers container margins and flex gaps responsively (`px-4 sm:px-6` and `gap-3 sm:gap-6`) to let search spotlight buttons shrink seamlessly without vertical page wraps.

---

## [0.9.5] - Premium Storefront Skeletons, Editorial Landing Pages, Snap Carousels, & Brand Storefront Profiles (25 May 2026)

### Added
- **Pulse-Shimmering Skeletons**: Integrated an automatic layout skeletonizer wrapper (`<Skeletonify />` / `.skeleton-auto`) to dynamically paint shimmer overlays on any active React tree without layout shifts.
- **Parallax Landing Hero**: Added dynamic editorial curation grids, parallax image layers, and smooth anchors targeting catalog products.
- **Brand Storefront Profiles**: Developed merchant product collections segments (`/store/merchants/[id]`) showing vendor stats, badges, and verified product lists.
- **HSL Inverted Obsidian Dark Mode**: Standardized theme factory switches across storefront routes.

---

## [0.9.0] - Premium Mobile Storefront Responsiveness & Native-App UX (25 May 2026)

### Added
- **App-like Sticky Bottom Navbar**: Mounted fixed bottom navigation anchors (`<MobileNavbar />`) to easily toggle cart, category drawers, explore feeds, and user profiles.
- **Category Explorer Drawer**: Full-screen slide-up exploration sheets for catalogs (`<MobileCategoryDrawer />`).
- **Collapsible Checkout Summary Accordions**: Touch-collapsible cart summaries showing itemized fees on narrow devices.

---

## [0.8.5] - Premium Spotlight Search, Mega-Menus & Inventory Resolution (21 May 2026)

### Added
- **Immersive Spotlight Search (⌘K)**: Added full-screen blurred backdrop modal panel (`z-[100]`), global keyboard listener hotkeys (`⌘K`, `Ctrl+K`, `/`), and static search trigger buttons in the storefront header.
- **Search Command Palette Layout**: Dual-pane Command Palette modal including localStorage recent search history (max 5 items, clear function), quick actions (View Cart, Sell on Martnex), and trending categories.
- **Search Query Matching**: Real-time backend search fetching with query-highlighting matching inside product titles via subcomponent `<HighlightedText>`.
- **Keyboard Cycle Navigation**: Fully integrated focus cycles (`ArrowDown`/`ArrowUp`) and execution handlers (`Enter` to open, `Escape` to close) within the spotlight search panel.
- **Premium Category Mega-Menus**: Hover-triggered glassmorphic dropdown navigation panels for *Apparel*, *Footwear*, and *Lifestyle* categories, complete with 150ms timeout hover-leave buffers, detailed subcategory navigation grid, and visual featured product cards displaying Unsplash catalog listings in `store-header.tsx`.
- **Dynamic Catalog Seeding**: Enhanced seeding backend with rich products, stock images (multiple URLs per product), correct variant pricing, and inventory mappings.

### Fixed
- **Order Placement Inventory Resolution**: Addressed order place inventory mapping so that when an order is placed, inventories are successfully decremented and resolved in Medusa backend.
- **Seeding Pricing Fixture**: Fixed missing pricing variables on variant options during the backend seed execution.

---

## [0.8.0] - Storefront UI/UX Premium Revamp (Phase 2) (21 May 2026)

### Added
- **Scrolly Header & Autocomplete**: Interactive sticky storefront header with scroll state transitions and interactive query prediction autocompletes.
- **Slide-over Side-Cart Drawer**: Smooth side-sliding cart drawer overlay showing total item listings, price breakdown, and immediate checkout shortcuts.
- **Currency-Aware Progress Shipping Meter**: Real-time progress bar in cart and drawer showing remaining spend required to qualify for free shipping.
- **Dynamic Quick Add Variants**: Instant checkout card dialog to select size/color options and add directly from product listing cards.
- **Custom-Styled Stripe Focus Boundaries**: Seamless premium focused inputs and error highlight boundaries inside Stripe Elements checkout field wrappers.
- **Transaction Processing Stepper States**: Stepper animation stages showing cart, shipping setup, payment, and transaction processing state layers.
- **Particle Confetti Receipt Celebration**: Interactive spring-particle confetti canvas trigger mounted on successful order reception.
- **Micro-interactions**: Spring-bounce animators (`animate-bounce-spring` in `globals.css`) dynamically popping the cart quantity badge on count increases.

---

## [0.7.1] - Checkout Stability & Infrastructure Fixes (20 May 2026)

### Fixed
- **Payment Step — 3 checkout bugs**:
  - COD-only mode rendered a duplicate "Place Order" button; removed duplicate.
  - Clicking the COD method card immediately triggered order placement; click now only selects the provider.
  - Stripe flow: `ensureShipping()` was called after card confirmation instead of before; moved to top of `handlePlaceOrder` so shipping is resolved before any payment session is created.
- **Checkout — "No shipping options available"**: The Medusa fulfillment stack (fulfillment set, service zone, shipping options, `manual_manual` provider link to stock location) was never provisioned on fresh installs. Added `backend/src/scripts/setup-shipping.ts` with idempotent end-to-end setup and wired it as `pnpm run setup-shipping`.
- **Checkout — "Cart items require shipping profiles"**: Existing products had no rows in `product_shipping_profile`. Seed script (new Step 8) now repairs missing links on every run. `create-seller-product.ts` workflow now links each new product at creation time via `linkProductToShippingProfileStep`.
- **Cart — Add-to-cart blocked on all products**: Variants had `manage_inventory=true` but no `product_variant_inventory_item` rows, so inventory lookups always returned empty and the cart refused items. Seed script now repairs missing variant→inventory links and creates default inventory levels (100 units). Seller product workflow enforces correct links for all new products.

### Changed
- `payment-step.tsx`: Refactored into two named sub-components — `CodOnlyPaymentStep` (used when Stripe key is absent) and `PaymentStepWithStripe` (used inside `<Elements>`) — sharing `MethodCard` and `PlaceOrderButton` primitives. Processing step labels now shown inline: *"Setting up shipping…" → "Preparing payment…" → "Placing order…"*.
- `SETUP_INSTRUCTIONS.md`: Added required **Step 5** (`pnpm run setup-shipping`) between seed and server start, with an explicit callout that skipping it causes "No shipping options available" at checkout.
- `package.json` (backend): Added `"setup-shipping": "medusa exec ./src/scripts/setup-shipping.ts"` script.

---

## [0.7.0] - Phase 6: Buyer Storefront — Browse, Cart, Checkout & Confirmation (19 May 2026)

### Added
- **Buyer Storefront** (`/store`):
  - Product listing page with live search (`?q=`) and category filter (`?category=`) via URL params.
  - Responsive product grid with loading skeleton and empty state.
  - `ProductCard` component with thumbnail, price display, and add-to-cart action.
- **Product Detail Page** (`/store/products/[handle]`):
  - `VariantSelector` component — option matrix (size, colour, etc.) maps to variant IDs.
  - Add-to-cart with lazy cart creation (region-aware).
- **Cart** (`/store/cart`):
  - `useCart` hook — localStorage-persisted cart ID (`martnex_cart_id`), lazy cart creation, `addItem` / `removeItem` / `updateQuantity` / `updateCart` mutations.
  - `CartItemRow` with quantity stepper and remove button.
  - `CartSummary` showing subtotal, shipping, tax, total and Checkout CTA.
- **Checkout** (`/store/checkout`) — 2-step wizard:
  - Step 1: Shipping address form (`react-hook-form`, full validation).
  - Step 2: Payment — `PaymentStep` supports **Stripe Elements** (card) and **Cash on Delivery**.
  - Stripe provider is opt-in: only rendered when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set.
  - Cart is completed via `POST /store/carts/:id/complete`; on success navigates to confirmation.
- **Order Confirmation** (`/store/orders/[id]`):
  - Success hero, itemised receipt, shipping address, Continue Shopping CTA.
- **Store Layout Shell**:
  - `StoreHeader` — sticky nav with logo, search-by-URL form, category links (first 4), cart icon with item-count badge, mobile menu.
  - Footer with brand and Medusa attribution.
- **Backend — Stripe Payment Module**:
  - `@medusajs/payment-stripe` registered in `medusa-config.ts`, conditional on `STRIPE_API_KEY` env var.
- **New Hooks**:
  - `use-products` — `useProducts(params)`, `useProduct(handle)`, `getDisplayPrice` helper.
  - `use-regions` — `useRegions()`, exposes `defaultRegion` for cart creation.
  - `use-cart` — full cart lifecycle; exports `clearStoredCartId`.
  - `use-checkout` — `setAddress`, `getShippingOptions`, `setShippingMethod`, `initPayment`, `completeOrder`.
- **Unit Tests** (16 new):
  - `hooks/__tests__/use-products.test.ts` — 8 tests: list, search, category filter, error, handle fetch, not-found null, disabled when empty handle, `getDisplayPrice`.
  - `hooks/__tests__/use-cart.test.ts` — 8 tests: empty state, fetch existing, 404 clear, addItem create, addItem existing, removeItem, updateQuantity, itemCount sum.

### Changed
- **Home page** (`/`): primary CTA changed from "Initialize Account" to "Browse Marketplace" linking to `/store`.

---

## [0.6.0] - Phase 5: Seller Dashboard, Order Detail & Payouts UI (18 May 2026)

### Added
- **Order Detail Page** (`/seller/orders/[id]`):
  - Fetches from `GET /store/sellers/me/orders/:id` via new `useSellerOrder` hook.
  - Displays seller-scoped line items with thumbnails, per-item pricing, and seller subtotal footer.
  - Customer info card, shipping address card, payment status card.
  - Skeleton loading state, error state, Refresh button, and back-navigation to orders list.
- **`useSellerOrder` hook** — single-order variant of `useSellerOrders`; shares the same type definitions.
- **`SellerOrder` type** extended with `shipping_address?: SellerOrderShippingAddress`.
- **Dashboard real data** (`/seller`):
  - `useDashboardStats` hook — fetches orders + commissions in parallel, derives Total Revenue, Active Orders, Approved Earnings, and Commission Count.
  - `StatsGrid` updated: replaced hardcoded stats with live data and a 4-card loading skeleton.
  - `ActivityFeed` updated: replaced random order numbers with the 5 most recent real orders, each linking to its detail page; live time-ago labels.
- **Payouts page** (`/seller/payouts`):
  - Stats summary: Total Requested, Pending Review, Completed.
  - Full payout history table with date, amount, commission count, and status badge.
  - Skeleton loading and empty state.
- **`useSellerPayouts` hook** — fetches `GET /store/payouts`; exposes `payouts`, `stats`, `isLoading`, `refetch`.
- **`useRequestPayout` mutation** — posts to `POST /store/payouts`; on success invalidates both `seller-payouts` and `dashboard-stats` query caches.
- **Route unit tests** — 17 tests across two new spec files:
  - `backend/src/api/store/sellers/me/orders/__tests__/route.spec.ts` (9 tests)
  - `backend/src/api/store/sellers/me/orders/[id]/__tests__/route.spec.ts` (8 tests)

### Changed
- **Orders table** (`/seller/orders`): entire row is now clickable via `router.push`; ChevronRight button navigates independently with `stopPropagation`.
- **Seller sidebar**: Payouts nav item added (Banknote icon); active-state matching changed from strict equality to `startsWith` so nested routes (e.g. `/seller/orders/[id]`) highlight correctly.
- **Dashboard header** label changed from "Last 30 Days" to "All Time" to match the all-time aggregation from the commissions API.

---

## [0.5.0] - Phase 4: Seller Order Fulfillment & Product Stability (13 May 2026)

### Added
- **Seller Order Fulfillment API** (`GET /store/sellers/me/orders`, `GET /store/sellers/me/orders/:id`):
  - Lists all orders that contain the authenticated seller's products.
  - Scopes line items to the seller's own products and computes `seller_subtotal` per order.
  - Returns 403 if a requested order contains none of the seller's products.
  - Protected by `authenticate("customer", ["session", "bearer"])` middleware.
- **Order-Placed Subscriber** (`order.placed` event):
  - Automatically creates `Commission` records when any order is placed.
  - Resolves the seller and their commission rate via `query.graph`.
  - Defaults to 10% commission if no custom rate is set for the seller.
  - Never throws — commission failure is non-blocking for the order placement itself.
- **`useSellerOrders` hook** (`frontend/src/hooks/use-seller-orders.ts`):
  - React Query hook with typed `SellerOrder` / `SellerOrderItem` interfaces.
  - Helper formatters: `formatOrderStatus`, `formatCustomerName`, `formatCurrency`.
- **Seller Orders Dashboard page** (`/seller/orders`):
  - Replaced static mockup with live data from the API.
  - Loading skeleton, client-side search, status filter, live stat counters, Refresh button, empty state.
- **`useUpdateProduct` hook**:
  - Standalone mutation hook for the edit page so it no longer triggers an unnecessary full list fetch.

### Changed
- `create-seller-product.ts` workflow: `createRemoteLinkStep` → `createSellerProductLinkStep` (Knex).
- `delete-seller-product.ts` workflow: `dismissRemoteLinkStep` → `deleteSellerProductLinkStep` (Knex).
- `seller-product.ts` link: reverted `isList: true` (kept as default 1:1; multi-product handled via raw SQL).
- `useSellerProducts` hook: `staleTime` reduced to `0`; `refetch` exposed; error state added to products page.

---

## [0.4.0] - Phase 3: Core Infrastructure (April 2026)

### Added
- **Seller Product Management (Shopify-style)**:
  - **Advanced Variant Builder**: Dynamic generation of product variants based on attributes (size, color, etc.).
  - **Premium Image Upload**: Multi-file drag-and-drop uploader with progress tracking and gallery management.
  - **Two-Column Form Layout**: Optimized Shopify-style interface for product data entry.
  - **Ownership Enforcement**: Strict server-side validation ensuring sellers can only manage their own products via the `seller-product` module link.
  - **Image Lifecycle E2E Coverage**: Added a Playwright journey for upload, persist-after-reload, deferred delete, and post-save cleanup.
- **Tech Stack Upgrade**:
  - Migrated frontend to **Next.js 16.2** and **React 19**.
  - Fully implemented **Tailwind CSS v4** with native `@theme` integration.
  - Standardized on **pnpm 10+** for package management.
- **Design System Evolution**:
  - Introduced "Visual Excellence" standards focusing on micro-animations, glassmorphism, and premium aesthetics.
  - Standardized `<BaseDashboardLayout />` and `<EmptyState />` components.

### Changed
- **Seller product workflows** now use Medusa core create/update workflows with normalized simple-product and variant option payloads.
- **Seller product media** is now served from `/static/...` via the Medusa local file provider to avoid broken upload URLs in local development.
- **Image deletion behavior** is deferred until a successful product save using `pending_delete_file_ids` and `images[].metadata.file_id`.
- **Seller product list rendering** now normalizes backend media URLs and uses plain `<img>` thumbnails for backend-served uploads.
- **Store client request behavior** now deduplicates concurrent publishable-key and `/store/customers/me` lookups.

## [0.3.0] - Phase 3: Core Infrastructure (April 2026)

### Added
- **Verification Flow**: 
  - Status logic securely shifted to `customer.metadata.email_verified`.
  - **Auto-Sync Bridge**: Verifying an email now automatically approves the associated linked `Seller` profile and sets its `verified_at` timestamp.
  - **Manual Sync (↺)** button added to the UI Dashboard with loading animations for on-demand database polling.
- **Nodemailer Integration**: 
  - Created decoupled `EmailService` for SMTP handling.
  - Implemented real-time verification and password reset emails via background Medusa subscribers.
- **Custom UI Component Library** (`frontend/src/components/ui`):
  - Robust design system components based on variants: Button, Card, Input, Label (cva-based), Badge, Select, and a structured `AuthContainer`.
- **Seller Onboarding Wizard** (`frontend/src/app/onboarding/seller`):
  - Implemented a 3-step wizard (Business Info → Tax & ID → Payout Details) with progress bar and animated transitions.
- **Seller Dashboard** (`frontend/src/app/seller`):
  - Persistent sidebar layout implemented.
  - Views added: Overview stats grid, Products listing table, and Orders management.
- **Home & Dashboard Aesthetics**:
  - Full Swiss-modernism and premium SaaS themes applied across the codebase.
  - Dashboard routes users distinctly based on `buyer`/`seller` roles and prevents React Strict Mode hydration double-fires using `useRef`.

### Changed
- **Authentication & Redirection Redesign**:
  - Removed glassmorphism, switching to clean `bg-mesh` light theme wrappers.
  - `AuthLayout` now intelligently allows unverified, logged-in users to access the `/verify-email` page, while bouncing verified users straight to the dashboard.
  - Verification success instantly fires a `refreshUser` background re-fetch and routes the user to the Dashboard automatically.
  - Login form moved entirely to the native Medusa `/auth/customer/emailpass` endpoint, ensuring tokens properly cover all `/store/*` routes.
- **State Management & Caching**:
  - `useAuthStore` upgraded to support `setCredentials` injection.
  - Executed strict cache-busting (`cache: 'no-store'`, `revalidate: 0`) for user profile syncing to reflect server-side changes instantly.
- **Global Layout & Styling**:
  - Completely migrated `globals.css` to Tailwind v4 native `@theme` variables.
  - Centralized fonts (Work Sans, Outfit) and utility classes (`shadow-premium`).
- **Medusa Backend Validation**:
  - Corrected the `updateCustomers` multi-argument TypeScript API signature to align with Medusa v2 typings.
  - Strengthened `authCors` config in `medusa-config.ts` to allow local app access loops.
  - `GET /auth/publishable-key` dynamic endpoint added and integrated with a runtime frontend caching utility.
  - Overhauled backend startup script (`start.sh`) for idempotent schema syncs.

### Removed
- Stripped legacy `/auth/token` fallback route dependencies.
- Purged outdated `api-client.ts` frontend copy.

---

## [2.5.0] - Phase 2.5: Security Hardening (December 2025)

### Added
- **JWT & Encryption Integrity**:
  - Implemented strict JWT management (15min access tokens, 7-day refresh tokens).
  - Bcrypt hashing (12 rounds) strictly enforced for password security.
- **Advanced Middleware**:
  - Object-level ownership verification middleware to protect seller resources.
  - Flexible RBAC layer accommodating normal buyers, dedicated sellers, and administrators.
- **Complete Auth Endpoints**:
  - Fully scaffolded Register, Login, Refresh, Me, Verify-Email, and Reset-Password REST routes.
  - Tested rigorously with 97 total integration tests specifically for system authentication.

---

## [2.0.0] - Phase 2: Multi-Vendor Extensions (December 2025)

### Added
- **Orchestrated Domain APIs**:
  - Built out 20 new endpoint routes spanning Store integrations and Admin oversights.
  - Explicit Medusa v2 "Module Links" mapping relationships across Sellers, Commissions, Orders, and Payouts.
- **Business Rule Ecosystem**:
  - Configurable guardrails for payouts (minimum limits, frequency thresholds) and overriding commission rates.
  - Immutable Audit Logging tracking administrative modifications to vendor statuses.
- **Background Subscribers**:
  - Initial `order-placed` lifecycle hook implemented to spin up provisional commission ledgers upon order confirmation.

### Changed
- **Dependencies Structure**:
  - Audited and updated all Medusa packages safely to `v2.12.1`.
  - Locked backend `tsconfig.json` module resolution to strictly target `Node16` for new types support.

---

## [1.0.0] - Phase 1: Initial Monolithic Foundation

### Added
- **Database & Architecture Drafts**:
  - Initial schema design laid out for multi-tenant interactions.
- **Custom Module Generation**:
  - **Seller Module**: Dedicated tracking of Vendor KYC logic and standing.
  - **Commission Module**: Fractional order routing logic per cart item.
  - **Payout Module**: Transfer coordination algorithms.
- **Conditional Payment Config Engine**:
  - Support ruleset for Stripe, PayPal, Bank Transfers, and intelligent conditional blocking for Cash On Delivery (COD).
- **Core Orchestration**:
  - `docker-compose.yml` set to deploy Postgres, Redis, Medusa API, and the Next.js Consumer app simultaneously.

### Changed
- Unified workspace tooling aggressively standardizing on `pnpm`.
- Next.js 16 (React 19) structured using the `app/` router.
- Shifted all Backend styling formats from TypeORM to the standardized MikroORM engine utilized by Medusa v2.

---

## How to Update This File

When making changes, adhere to the standard format:
1. Append items under the **[Unreleased]** or highest active phase.
2. Underline items by impact: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.
3. Group related entries concisely.
