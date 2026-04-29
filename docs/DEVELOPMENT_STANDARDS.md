# Martnex Development Standards

This document outlines the technical standards, architectural patterns, and design philosophy for the Martnex project.

## 1. Architectural Philosophy

### Feature-Sliced Frontend
The Next.js frontend follows a strict **Feature-Sliced Architecture**.
- **`app/`**: Route definitions only. No business logic or inline API calls.
- **`components/`**: Divided by domain (`admin/`, `seller/`, `auth/`) and shared components.
- **`hooks/`**: Data fetching logic using React Query.
- **`ui/`**: Pure UI primitives (Shadcn/UI).

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

## 5. Security & Validation
- **Input Validation**: Mandatory Zod schemas for all forms and API payloads.
- **Ownership Enforcement**: Verify resource ownership on every backend operation.
- **Environment Secrets**: Never hardcode secrets; use `.env` files.
