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

## 2. Core Identity
- **Martnex:** An open-source multi-vendor marketplace built on Medusa.js (v2) and Next.js (v15+).
- **Three Core Roles:** 
  1. **Buyer:** Browse, purchase, review products.
  2. **Seller:** Manage products, track earnings, request payouts.
  3. **Admin:** Manage platform, approve sellers, resolve disputes.

## 3. Global Technical Hard Rules (REQUIRED)
- **Package Manager:** **pnpm only.** Never use npm or yarn.
- **Dependencies:** ALWAYS use the latest versions (`pnpm add <pkg>@latest`). Verify latest version with `npm view <pkg> version` first.
- **TypeScript:** Strict mode is mandatory. Avoid `any` types at all costs.
- **Database:** Medusa v2 uses **MikroORM** and DML (Data Model Language).
- **E2E Testing:** Playwright is used in the `frontend` directory (`npx playwright test`).

## 4. AI Assistant Standards (How to Work)
- **Concise & Actionable:** Skip pleasantries; get to the code and solution.
- **Show, Don't Tell:** Provide code examples rather than long theoretical explanations.
- **Flag Risks:** Proactively warn about breaking changes, security vulnerabilities, or complex migrations.
- **"Fixed" Convention:** 
  - Use "Fixed" only for bugs discovered in already merged/released code.
  - Corrections during active development are part of implementation, not "fixes."

## 5. Security Principles
- No hardcoded secrets (use `.env`).
- Validate all inputs with **Zod**.
- Security-first mindset: validate inputs, sanitize outputs, follow OWASP guidelines.

## 6. Integration Checklist
- [ ] TypeScript types are correct.
- [ ] Inputs are validated (Zod).
- [ ] No console.logs in production.
- [ ] API responses follow the project format: `{ success: true, data: {...} }`.
- [ ] Documentation/CHANGELOG updated.

## 7. Frontend Architecture (CURRENT STATE — Feature-Sliced, Complete)

The Next.js frontend has been fully refactored from a monolithic anti-pattern to a clean feature-sliced architecture. **Do not revert to the old pattern.**

### Directory Convention
```
src/
├── app/              # Route files ONLY — no business logic, no inline API calls
├── components/
│   ├── admin/        # Admin-domain UI (admin-sidebar, admin-header)
│   ├── seller/       # Seller-domain UI
│   │   ├── layout/   # SellerSidebar, SellerHeader, VerificationBanners
│   │   ├── dashboard/# StatCard, StatsGrid, SalesChartPlaceholder, ActivityFeed
│   │   └── onboarding/ # Step form components + Zod schema module
│   ├── auth/         # Auth form components (LoginForm, RegisterForm, etc.)
│   ├── shared/
│   │   └── guards/   # <ProtectedRoute /> — use this everywhere, no manual redirects
│   └── ui/           # shadcn/ui primitives only
└── hooks/            # Data fetching with React Query
    └── use-seller-profile.ts
```

### Critical Patterns to Follow

**1. Hydration — ALWAYS use `mounted` pattern, NEVER `typeof window`:**
```ts
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <LoadingScreen />; // Same on SSR and CSR → no mismatch
```

**2. Route Protection — ALWAYS use `<ProtectedRoute />`:**
```tsx
export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminSidebar /><AdminHeader />{children}
    </ProtectedRoute>
  );
}
```

**3. Data Fetching — ALWAYS use React Query hooks, never inline `useEffect` fetches:**
```ts
const { seller, isLoading, isVerified } = useSellerProfile();
// React Query caches for 5min — no duplicate API calls
```

**4. Component Internal Structure — Use shadcn/ui primitives, not raw divs:**
```tsx
// ✅ Correct
<Card><CardHeader>...</CardHeader><CardContent>...</CardContent></Card>

// ❌ Wrong — creates inconsistency
<div className="bg-white rounded-xl p-6">...</div>
```

### Completed Milestones
- **Auth Persistence:** Medusa native `generateJwtToken` + `Modules.CACHE` (Redis) for refresh token rotation.
- **seller/layout.tsx:** 268 → 52 lines. Uses `useSellerProfile` hook + `<ProtectedRoute>`.
- **seller/page.tsx:** 114 → 27 lines. Dashboard split into `<StatsGrid>`, `<SalesChartPlaceholder>`, `<ActivityFeed>`.
- **admin/layout.tsx:** 156 → 34 lines. Uses `<AdminSidebar>`, `<AdminHeader>`, `<ProtectedRoute allowedRoles={['admin']}>`.
- **dashboard/page.tsx:** Monolithic auth `useEffect` removed. Wrapped in `<ProtectedRoute>`.
- **seller/onboarding/page.tsx:** 461 → 163 lines. Schema in `onboarding-schema.ts`. Each step is a standalone component.
- **`(auth)/layout.tsx`:** SSR hydration fixed with `mounted` pattern.
- **`<ProtectedRoute />`:** Fully hydration-safe; supports role-based gating.

### Remaining Work (Low Priority)
- `<BaseDashboardLayout />` — shared sidebar+header shell (deferred until 3rd portal)
- `hooks/use-admin-data.ts` — admin sellers page still fetches inline
- `hooks/use-customer-profile.ts` — buyer dashboard reads from Zustand (no extra API calls, acceptable)
- `components/shared/empty-states/` — not yet created

## 8. Backend Architecture
- **Medusa v2** with custom `seller` module (DML data model, workflow, API routes).
- **Auth:** Custom `/store/auth/token` and `/store/auth/token/refresh` endpoints using `generateJwtToken` from `@medusajs/framework/utils`.
- **Redis:** Used via `Modules.CACHE` for refresh token storage (Medusa Cloud compatible).
- **E2E Testing:** Playwright configured for `Complete User Journey` (auth + seller onboarding).
