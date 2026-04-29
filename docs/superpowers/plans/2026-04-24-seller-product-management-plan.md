# Seller Product Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust seller-facing product management system with variant support and image uploads, ensuring strict ownership enforcement.

**Architecture:** Feature-sliced architecture with backend API routes enforcing seller ownership via the `seller-product` module link. Frontend uses React Query for high-performance data fetching and shadcn/ui for a premium, Shopify-style UI.

**Tech Stack:** Medusa v2, Next.js 16, Tailwind CSS v4, React Query, Zod, react-hook-form, Lucide React.

---

### Task 1: Backend: Sync Module Links
- [x] **Step 1: Verify the link definition**
- [x] **Step 2: Sync links with the database**
- [x] **Step 3: Commit**

### Task 2: Backend: List & Get Seller Products API
- [x] **Step 1: Implement GET List route**
- [x] **Step 2: Implement GET Single route**
- [x] **Step 3: Commit**

### Task 3: Backend: Create & Update Product API
- [x] **Step 1: Implement POST Create route**
- [x] **Step 2: Implement POST Update route**
- [x] **Step 3: Commit**

### Task 4: Frontend: Hooks for Product Management
- [x] **Step 1: Implement useSellerProducts hook**
- [x] **Step 2: Implement useProductCategories hook**
- [x] **Step 3: Commit**

### Task 5: Frontend: UI Components
- [x] **Step 1: Build VariantBuilder**
- [x] **Step 2: Build ImageUpload**
- [x] **Step 3: Build ProductsTable**
- [x] **Step 4: Commit**

### Task 6: Frontend: Pages
- [x] **Step 1: Implement Create Page**
- [x] **Step 2: Implement Edit Page**
- [x] **Step 3: Wire up List Page**
- [x] **Step 4: Commit**

### Task 7: Integration Fixes (Role Synchronization)
- [x] **Step 1: Update register-seller workflow**
Update the user's `auth_identity` to the `seller` role upon profile creation.
- [x] **Step 2: Update Login JWT**
Include `role` in the JWT `app_metadata` in `POST /auth/token`.
- [x] **Step 3: Commit**

### Task 8: Verification
- [x] **Step 1: Run E2E Tests**
- [x] **Step 2: Final UI Check**

### Post-Implementation Notes
- [x] **Image lifecycle hardening**: upload previews are immediate, but file deletion is deferred until a successful create/update.
- [x] **Media URL normalization**: local file uploads are served from `/static/...` and normalized in shared frontend hooks/components.
- [x] **Verification coverage**: `pnpm playwright test e2e/seller-product-images.spec.ts --retries=0` validates create, reload, deferred delete, and post-save asset cleanup.

---

**Status: Phase COMPLETE ✅**

