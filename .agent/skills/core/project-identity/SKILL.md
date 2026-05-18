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

## 4. AI Assistant Standards (How to Work)
- **Concise & Actionable:** Skip pleasantries; get to the code and solution.
- **Show, Don't Tell:** Provide code examples rather than long theoretical explanations.
- **Flag Risks:** Proactively warn about breaking changes, security vulnerabilities, or complex migrations.
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
│   │   ├── guards/   # <ProtectedRoute /> — use this everywhere
│   │   ├── layouts/  # <BaseDashboardLayout />
│   │   └── empty-states/ # <EmptyState />
│   └── ui/           # shadcn/ui primitives only
└── hooks/            # Data fetching with React Query (staleTime: 30s-5min)
```

### Critical Patterns to Follow

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
- **Auth:** Custom token endpoints in `/store/auth` using `generateJwtToken`.
- **Roles:** User roles are synchronized between `auth_identity` and the business logic layer.
- **Seller Product API:** Seller product create/update routes normalize frontend-friendly payloads into Medusa core workflow inputs.
- **File Storage:** Local file uploads are served from `/static` via the Medusa file module; seller uploads use `/store/uploads` and `/store/uploads/:id`.
- **Redis:** Mandatory for production-like environments (via `Modules.CACHE`).

## 9. Architecture Notes & Known Constraints
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
