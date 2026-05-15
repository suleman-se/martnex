# Seller Product Management — Design Spec

**Date:** 2026-04-24  
**Status:** Implemented — Updated to reflect shipped behavior as of 2026-04-29  
**Feature:** Seller-facing product CRUD with variants, categories, and image upload

---

## 1. Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| Scope | CRUD + Variants + Categories | Production-ready product model; unblocks buyer storefront |
| Form UI | Two-column page (Shopify-style) | Industry-standard; best space for variant builder |
| Variant builder | Option Matrix → auto-generate combinations | Matches Medusa's native data model exactly |
| Image upload | Medusa local file provider via `/static` | Works in Docker today; swap to S3 later via config only |
| Category management | Admin-managed global taxonomy | Uses Medusa's built-in `ProductCategory` module; zero custom code |

---

## 2. Scope

### In scope
- Seller can **create** a product with title, description, price, images, stock, category, and variants
- Seller can **list** their own products (scoped — cannot see other sellers' products)
- Seller can **edit** an existing product (all fields)
- Seller can **delete** a product
- Seller can define **product options** (e.g. "Size": S/M/L, "Color": Red/Blue) and the system auto-generates all variant combinations
- Seller sets **price and stock** per variant row
- Seller uploads **images** via Medusa's local file service and can remove them safely after a successful save
- Seller picks a **category** from an admin-managed dropdown (read-only from seller's perspective)

### Out of scope (future sprints)
- Product status workflow (Draft → Pending Admin Approval → Published) — Phase 2
- Seller-created categories — intentionally excluded (catalogue quality)
- Inventory reservations / stock holds
- Product tags / SEO fields
- Bulk import/export

---

## 3. System Architecture

```
Frontend (Next.js)                Backend (Medusa v2)           Medusa Modules
──────────────────                ──────────────────            ──────────────

Pages                             API Routes (store/)           ProductModule
  /seller/products          ───►    GET  /sellers/me/products ──►  products
  /seller/products/new      ───►    POST /sellers/me/products      variants, options
  /seller/products/[id]/edit ──►    POST /sellers/me/products/:id  prices
                                    DEL  /sellers/me/products/:id
                                                                ProductCategoryModule
React Query Hooks                   GET  /product-categories ──►  admin-managed tree
  use-seller-products.ts            POST /uploads (file svc)
                                    DEL  /uploads/:id (queued cleanup)
  use-product-categories.ts                                    FileModule
                                  Auth Middleware                local file service
Components                          JWT validation              (swap → S3 via config)
  ProductForm.tsx                   Ownership check
  VariantBuilder.tsx                (seller owns product)      SellerModule (custom)
  ImageUpload.tsx                                                module link:
  ProductsTable.tsx                                              seller ↔ product
```

**Key constraint:** Every backend route validates the JWT and checks that the authenticated seller owns the product being mutated. A seller cannot read, edit, or delete another seller's product.

---

## 4. Backend

### 4.1 API Routes

All routes live under `backend/src/api/store/sellers/me/products/`.  
All routes require a valid seller JWT (existing auth middleware).

| Method | Path | Description |
|---|---|---|
| `GET` | `/store/sellers/me/products` | List authenticated seller's products. Supports `?category_id=`, `?q=` search, pagination |
| `POST` | `/store/sellers/me/products` | Create a new product linked to the seller |
| `GET` | `/store/sellers/me/products/:id` | Get a single product (ownership enforced) |
| `POST` | `/store/sellers/me/products/:id` | Update product (ownership enforced; Medusa store update pattern) |
| `DELETE` | `/store/sellers/me/products/:id` | Delete product (ownership enforced) |
| `GET` | `/store/product-categories` | List all admin-managed categories (for dropdown) |
| `POST` | `/store/uploads` | Upload image files; returns `uploads: [{ id, url }]` |
| `DELETE` | `/store/uploads/:id` | Delete an uploaded file by id |

### 4.2 Module Link

A new module link is required to associate a product with a seller:

```
backend/src/links/seller-product.ts

defineLink(
  ProductModule.linkable.product,
  SellerModule.linkable.seller
)
```

This allows filtering `products` by `seller_id` using Medusa's query engine.

### 4.3 Product Creation Payload

```typescript
{
  title: string;                    // required
  description?: string;
  category_ids?: string[];          // admin-managed category IDs
  pending_delete_file_ids?: string[];
  images?: {
    id?: string;
    url: string;
    metadata?: { file_id?: string } | null;
  }[];                              // uploaded via file service first
  options: {                        // e.g. [{ title: "Size", values: ["S","M","L"] }]
    title: string;
    values: string[];
  }[];
  variants: {                       // auto-generated from option matrix
    id?: string;                    // preserved on edit to avoid duplicate variant creation
    title: string;                  // e.g. "S / Red"
    options: { title: string; value: string }[];
    prices: { amount: number; currency_code: string }[];
    inventory_quantity: number;
    sku?: string;
  }[];
}
```

**Implementation note:** On create and update, the seller routes normalize the frontend's array-based variant option shape into the object-map shape Medusa core workflows expect.

---

## 5. Frontend

### 5.1 New Routes

```
frontend/src/app/seller/
├── products/
│   ├── page.tsx              ← EXISTS (replace placeholder with real table)
│   ├── new/
│   │   └── page.tsx          ← NEW
│   └── [id]/
│       └── edit/
│           └── page.tsx      ← NEW
```

### 5.2 New Components

```
frontend/src/components/seller/products/
├── ProductsTable.tsx          ← Product list table with search/filter/actions
├── ProductForm.tsx            ← Shared two-column form (used by new + edit pages)
├── VariantBuilder.tsx         ← Option matrix UI → generates variant rows
└── ImageUpload.tsx            ← Drag-drop upload → calls /store/uploads
```

### 5.3 New Hooks

```
frontend/src/hooks/
├── use-seller-products.ts     ← list, create, update, delete (React Query, 30s stale)
└── use-product-categories.ts  ← fetch categories for dropdown (5min stale)
```

### 5.4 Page Layout — Products List (`/seller/products`)

- **Header row:** "Products" title + "Add Product" button (links to `/seller/products/new`)
- **Filter bar:** Search input, Category dropdown, Status dropdown
- **Table columns:** Thumbnail · Product title · Category · Price · Stock · Actions (Edit / Delete)
- **Empty state:** `<EmptyState>` component — "No products yet. Add your first product."
- **Delete:** Confirmation dialog before calling DELETE route

### 5.5 Page Layout — Create/Edit Form (`/seller/products/new`, `/seller/products/[id]/edit`)

Two-column layout:

**Left column (main content):**
1. **General** section — Title (required), Description (textarea)
2. **Options & Variants** section — `<VariantBuilder />`
   - Add option name (e.g. "Size") + values (tag chips: S, M, L with ×)
   - "+ Add option" to add more option groups
   - Auto-generated variant table below: columns = variant title, price, stock, SKU

**Right sidebar:**
1. **Status** — Draft / Published dropdown
2. **Save Product** button (primary CTA)
3. **Category** — single-select dropdown from admin categories
4. **Images** — `<ImageUpload />` drag-drop zone, shows thumbnails, persists `metadata.file_id`, and queues deletions for post-save cleanup

### 5.6 Variant Builder Logic

```
Options defined:
  Size: [S, M, L]
  Color: [Red, Blue]

Combinations generated (cartesian product):
  S/Red · S/Blue · M/Red · M/Blue · L/Red · L/Blue

Each combination = one variant row:
  | Variant | Price | Stock | SKU |
  | S / Red | $--   | ---   | --- |
  ...
```

Seller fills in price + stock per row. SKU is optional.

---

## 6. Data Flow — Create Product

```
1. Seller fills form + uploads images
  └─► POST /store/uploads → returns { uploads: [{ id, url }] }

2. Seller clicks "Save Product"
   └─► POST /store/sellers/me/products
     Body: { title, description, category_ids, images, options, variants, pending_delete_file_ids }

3. Backend:
   a. Validate JWT → get seller_id
  b. Normalize simple products and variant option payloads for Medusa core workflows
  c. Call createProductsWorkflow(payload)
  d. Create module link: seller_id ↔ product.id
  e. Return created product

4. React Query invalidates useSellerProducts cache
5. Redirect to /seller/products (list)
```

### 6.1 Data Flow — Remove Uploaded Image

```
1. Seller removes an image in the form UI
  └─► Remove image from form state immediately
  └─► Push `metadata.file_id` into `pending_delete_file_ids`

2. Seller saves the product
  └─► POST /store/sellers/me/products or /store/sellers/me/products/:id

3. Backend:
  a. Persist the updated product first
  b. If save succeeds, call deleteFilesWorkflow for queued file ids

4. Physical file disappears from `/static/...` only after the successful save
```

---

## 7. Error Handling

| Scenario | Handling |
|---|---|
| Unauthenticated request | 401 → redirect to `/login` (existing `<ProtectedRoute />`) |
| Seller tries to edit another seller's product | 404 returned by the ownership-enforced seller route |
| Required fields missing | Zod validation on backend; client-side `react-hook-form` validation |
| Image upload fails | Toast error; image not added to form state |
| Image removed before save | UI removes image immediately; file id is queued and deleted only after successful save |
| Create/update API fails | Toast error message; form stays open (no data loss) |
| Delete fails | Toast error; product remains in list |

---

## 8. Architecture Rules (must follow)

These are non-negotiable per the project's feature-sliced architecture:

- **No inline `useEffect` fetches** — all data via React Query hooks
- **Route protection** — wrap both pages in `<ProtectedRoute allowedRoles={['seller']} />`
- **Empty states** — use `<EmptyState />` component, never inline idle divs
- **Hydration** — use the `mounted` pattern in any client component that reads auth state
- **Forms** — use `react-hook-form` + Zod schema for all validation
- **shadcn/ui primitives** — `<Card>`, `<Input>`, `<Select>`, `<Button>` etc — never raw divs

---

## 9. Implementation Order

The feature should be built in this order to allow incremental testing:

1. **Backend:** Module link (`seller ↔ product`)
2. **Backend:** API routes (list → create → get → update → delete)
3. **Backend:** Category list route
4. **Frontend:** `use-seller-products.ts` hook
5. **Frontend:** `use-product-categories.ts` hook
6. **Frontend:** `ProductsTable.tsx` + wire into existing `products/page.tsx`
7. **Frontend:** `ImageUpload.tsx` component
8. **Frontend:** `VariantBuilder.tsx` component
9. **Frontend:** `ProductForm.tsx` (two-column layout, uses ImageUpload + VariantBuilder)
10. **Frontend:** `products/new/page.tsx` (create flow)
11. **Frontend:** `products/[id]/edit/page.tsx` (edit flow — reuse ProductForm)

---

## 10. Open Questions (resolved)

| Question | Decision |
|---|---|
| Scope of variants | Option Matrix → auto-generate combinations (matches Medusa natively) |
| Image storage | Medusa local file provider served from `/static` (swap to S3 via config later) |
| Category ownership | Admin-managed global taxonomy only |
| Product status workflow | Deferred to Phase 2 (no approval flow in this sprint) |
