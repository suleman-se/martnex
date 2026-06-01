# Martnex Development Standards

This document outlines the technical standards, architectural patterns, and design philosophy for the Martnex project.

## 1. Architectural Philosophy

### Feature-Sliced Frontend
The Next.js frontend follows a strict **Feature-Sliced Architecture**.
- **`app/`**: Route definitions only. No business logic or inline API calls.
- **`components/`**: Divided by domain (`admin/`, `seller/`, `auth/`) and shared components.
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
- **Styling**: Tailwind CSS v4 (@theme integration).
- **State & Fetching**: React Query (TanStack Query) + Zustand.
- **Forms**: Zod + react-hook-form.

## 3. Visual Excellence & UX (The Superpowers Standard)
Every feature must feel premium and high-end.

- **Harmonious Palettes**: Avoid generic colors. Use curated HSL-tailored palettes.
- **Modern Typography**: Use Outfit/Inter pairings.
- **Micro-animations**: Subtle transitions and hover states for all interactive elements.
- **Component Quality**: Use Shadcn/UI primitives, not raw divs.
- **Realism**: No placeholders; use realistic mock data or generated images for demos.

## 4. Coding Patterns

### Component Reuse Rule
- Prefer composition over duplication.
- Do not introduce a new component when an equivalent shared component already exists.
- When in doubt, extend an existing shared component API rather than cloning the component.

### Hydration Safety
Always use the `mounted` pattern to avoid SSR/CSR mismatches:
```tsx
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

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
When working on seller product images, follow the current lifecycle contract:
- Upload immediately for preview.
- Persist the returned file id in `images[].metadata.file_id`.
- Queue removals in `pending_delete_file_ids`.
- Delete files only after the corresponding product create/update succeeds.
- Normalize any backend-served `/static/...` media URLs before rendering in the frontend.

### Strict TypeScript Type Safety
- **Zero `any` Types**: Prohibit the use of `any` types. Declare explicit, strictly defined interfaces for all component props, API request/response structures, and custom forms.
- **Interface Extension and Reuse**: Prevent redundant type declarations by extending base interfaces (e.g., `extends AddressInput`) or using standard utility types (`Omit`, `Partial`, `Pick`) to compose child structures.

### Overlay Scroll-Locking
- When implementing drawer panels, dialog modals, or spotlight overlays, prevent viewport/background scrolling on both desktop and mobile devices by calling the centralized `useBodyScrollLock(isOpen)` hook.

### Buyer Account Portal & Componentization (v0.9.8)
To maintain long-term codebase health and isolation, avoid placing large, monolithic forms or dialog states inside orchestrator route pages. All buyer account modules are componentized into isolated, reusable sub-components:
- **Centralized Types**: All buyer storefront address forms, profile configurations, and checkout inputs must use the shared, strictly typed schemas defined in `src/types/address.ts`. Redundant/duplicate models or inline `any` declarations are prohibited.
- **Address Card (`AddressCard`)**: Renders custom delivery addresses with status badges. Modifying/deleting addresses must safely bubble actions to parent handlers without containing full dialog/modal state inline.
- **Address Editor Card (`AddressEditorCard`)**: Manages individual address fields (names, phone numbers, postal codes). Dynamically calculates form validity, loading indicators, and sole-default checkbox locks.
- **Delete Address Dialog (`DeleteAddressDialog`)**: Encapsulates standard Radix `AlertDialog` layers, verifying safety constraints (e.g., promoting new defaults if deleting an active default, warning when deleting the sole saved address).
- **Checkout Saved Address Selector (`SavedAddressSelector`)**: Displays a high-contrast selectable grid of saved options at checkout. Emits normalized `AddressInput` values upon selection, including a custom card trigger to input new ad-hoc addresses seamlessly.

## 5. Security & Validation
- **Input Validation**: Mandatory Zod schemas for all forms and API payloads.
- **Ownership Enforcement**: Verify resource ownership on every backend operation.
- **Environment Secrets**: Never hardcode secrets; use `.env` files.
