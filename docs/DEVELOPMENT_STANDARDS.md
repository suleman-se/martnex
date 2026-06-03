# Martnex Development Standards

This document outlines the technical standards, architectural patterns, and design philosophy for the Martnex project.

## 1. Architectural Philosophy

### Feature-Sliced Frontend
The Next.js frontend follows a strict **Feature-Sliced Architecture**.
- **`app/`**: Route definitions only. No business logic or inline API calls.
- **`components/`**: Divided by domain (`admin/`, `seller/`, `auth/`, `store/`) and shared components.
- **`hooks/`**: Data fetching logic using React Query.
- **`ui/`**: Pure UI primitives (Shadcn/UI).

### Common Components First (Required)
- Reuse existing common components before creating new ones.
- Search these locations first: `src/components/shared`, `src/components/ui`, and existing domain folders.
- If a pattern repeats in 2+ places, refactor into a shared component instead of duplicating markup.
- Domain components (`admin/`, `seller/`, `store/`) should compose shared/common building blocks whenever possible.

### Modular Backend
The Medusa v2 backend is built using custom modules and workflows.
- **Custom Modules**: Seller, Commission, Payout, etc.
- **Module Links**: Extensive use of link modules (e.g., `seller-product`) to extend core entities.
- **File Handling**: Seller media uses the Medusa file module with local files served from `/static` in development.

## 2. Technical Standards

### Tooling
- **Package Manager**: `pnpm` (10+) is mandatory.
- **Runtime**: Node.js 20+.
- **Database**: PostgreSQL 15+ (MikroORM).
- **Cache**: Redis 7+.

### Frontend Stack
- **Framework**: Next.js 16 (App Router).
- **Styling**: Tailwind CSS v4 (`@theme` integration).
- **State & Fetching**: React Query (TanStack Query) + Zustand.
- **Forms**: Zod + react-hook-form.

## 3. Visual Excellence & UX (The Superpowers Standard)
Every feature must feel premium and high-end.

- **Harmonious Palettes**: Avoid generic colors. Use curated HSL-tailored palettes.
- **Modern Typography**: Use Inter via Google Fonts (loaded by `next/font`).
- **Micro-animations**: Subtle transitions and hover states for all interactive elements.
- **Component Quality**: Use Shadcn/UI primitives, not raw divs.
- **Realism**: No placeholders; use realistic mock data or generated images for demos.

### Dark Mode (Required)
All UI components **must** support dark mode. Rules:
- **The Inverted Palette Rule**: The project uses an inverted slate scale and color mappings in dark mode (`globals.css`):
  - `bg-white` automatically becomes obsidian dark (`#111827`).
  - `text-slate-900` automatically becomes white (`#ffffff`).
  - `border-slate-100` automatically becomes `#1e293b` (slate 800 divider border).
  - Due to this, to create elements that are **light on light mode, dark on dark mode** (e.g., standard panels, quick add buttons), use `bg-white text-slate-900 border-slate-100` directly without `dark:` overrides.
  - Conversely, standard Tailwind dark classes like `dark:bg-slate-900` or `dark:bg-slate-950` will actually render as **white/light** in dark mode. Avoid using them unless explicitly wanting a white background in dark mode.
- Never hardcode colors that only work in one mode. Standard auto-inverting classes (`bg-white`, `text-slate-900`, `border-slate-100`) adapt automatically — prefer those over `dark:` overrides.
- Prefer CSS variable tokens (`bg-card`, `text-foreground`, `bg-secondary`) defined in `globals.css` — these auto-invert in dark mode.
- For colors that do NOT have CSS variable equivalents (e.g., status colors like `bg-red-50`), always add an explicit dark variant: `dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50`.
- Auth screens must use `dark:bg-[#090d16]` for the page background and `dark:border-slate-700/40` for card borders.

## 4. Button Variants Reference

All variants in `src/components/ui/button.tsx` support both light and dark modes:

| Variant | Light | Dark |
|---|---|---|
| `default` | Black bg, white text | White bg, black text |
| `premium` | Black-to-slate gradient, white text | White-to-slate gradient, black text |
| `outline` | `slate-200` border, transparent bg | `slate-700` border, `slate-800` hover |
| `tonal` | `slate-100` surface | `slate-800` surface |
| `ghost` | Subtle `slate-100` hover | `slate-800` hover, muted text |
| `secondary` | CSS var `bg-secondary` | Auto-inverts via CSS var |
| `destructive` | CSS var `bg-destructive` | Auto-inverts via CSS var |
| `link` | CSS var `text-primary` | Auto-inverts via CSS var |

## 5. Responsive Breakpoints (Storefront)

| Viewport | Range | Nav Behavior |
|---|---|---|
| Mobile | `< 768px` | `MobileNavbar` (bottom bar); header hides desktop links |
| Tablet | `768–1023px` | `MobileNavbar` visible; account sidebar shows icons only (`md:w-16`) |
| Desktop | `≥ 1024px` | Full `StoreHeader` nav; account sidebar full width (`lg:w-64`) |

**Key rule:** Use `lg:` (1024px) as the mobile→desktop breakpoint for layout switches, not `md:`.

## 6. Coding Patterns

### Hydration Safety
For skeleton-aware hydration, show a skeleton instead of returning `null`:
```tsx
// Preferred: show skeleton during mount/loading, then real content
const showSkeleton = !mounted || !user
return (
  <div>
    <h1>Static Title</h1>  {/* always rendered */}
    {showSkeleton ? <SkeletonProfile /> : <RealForm />}
  </div>
)
```
For simple cases without a skeleton: `if (!mounted) return null` is still acceptable.

### Route Protection
Use the `<ProtectedRoute />` component for any gated routes:
```tsx
<ProtectedRoute allowedRoles={['admin']}>
  {children}
</ProtectedRoute>
```

### Complex Form Layouts
Use the **Shopify-style** two-column layout for product and setting forms:
- **Main Column**: Title, Description, Media.
- **Sidebar Column**: Status, Category, Visibility, Tags.
- **Sticky Actions**: Save/Cancel buttons always accessible.

### Seller Product Media
- Upload immediately for preview. Persist the returned file id in `images[].metadata.file_id`.
- Queue removals in `pending_delete_file_ids`. Delete files only after the product save succeeds.
- Normalize any backend-served `/static/...` media URLs before rendering.

### Strict TypeScript Type Safety
- **Zero `any` Types**: Declare explicit interfaces for all props, API request/response structures, and form state.
- **Interface Extension**: Use `Omit`, `Partial`, `Pick` to compose child structures rather than duplicating types.

### Storefront Componentization
Large storefront components must be broken into domain-level sub-components in the same slice folder:
- **`ProductCard`** → `ProductCardMedia`, `ProductCardDetails`, `QuickAddVariantSelector`
- **`SearchSpotlight`** → `SearchInput`, `SearchFilters`, `SearchResultsList`
- **`PaymentStep`** → `PaymentMethodCard`, `StripePaymentForm`

All sub-components receive state via props — no global store access inside presentational leaves.

### Account Loading Skeletons
Each account sub-page must have a matching loading skeleton in `src/components/shared/skeletons.tsx`:
- Always use `min-h-*` instead of fixed `h-*` to prevent buttons or text from overflowing the skeleton container.
- Static page titles/headers must always render immediately — only the data-dependent sections beneath them use skeletons.
- The `isLoading && token` pattern is preferred at checkout for conditional skeleton rendering.

## 7. Security & Validation
- **Input Validation**: Mandatory Zod schemas for all forms and API payloads.
- **Ownership Enforcement**: Verify resource ownership on every backend operation.
- **Environment Secrets**: Never hardcode secrets; use `.env` files.
