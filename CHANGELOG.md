# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Phase 3: Frontend UI, Auth Hardening & Medusa Compliance (April 2026)

- **Custom UI component library** (`frontend/src/components/ui/`):
  - `Button` — variants: default, premium, destructive, outline, secondary, ghost, link; sizes: sm, default, lg, xl, icon
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - `Input` — borderless with focus ring, consistent height
  - `Label` — `cva`-based with disabled peer styling
  - `Badge` — default, secondary, destructive, outline, vendor variants
  - `Select` — native select with `ChevronDown` overlay
  - `AuthContainer` — shared header/brand block used on all auth pages
- **Auth page redesigns** (Login, Register, Forgot Password, Reset Password):
  - Switched from dark glassmorphic layout to clean light Swiss-minimalism design
  - All pages now use shared `AuthContainer` + `Card` layout
  - Form inputs replaced with new `Input`/`Label`/`Button` components
  - Auth layout (`(auth)/layout.tsx`) simplified to light `bg-mesh` wrapper
- **Seller Onboarding** (`frontend/src/app/onboarding/seller/page.tsx`):
  - 3-step wizard: Business Info → Tax & Identification → Payout Details
  - Step progress bar and animated transitions
  - Payout method selection (bank transfer, PayPal)
  - Submits to `POST /store/sellers` with bearer token
- **Seller Dashboard** (`frontend/src/app/seller/`):
  - Persistent sidebar layout (`seller/layout.tsx`) with nav, search, user info
  - Overview page (`seller/page.tsx`) with stats grid and activity feed
  - Products page (`seller/products/page.tsx`) with table and image thumbnails
  - Orders page (`seller/orders/page.tsx`) with status badges and table
- **Home page redesign** (`frontend/src/app/page.tsx`):
  - Full Swiss-modernism treatment with feature cards and CTA buttons
- **Dashboard page updates** (`frontend/src/app/dashboard/page.tsx`):
  - Role-specific seller profile check on load (`/store/sellers/me`)
  - Deduplication guard on seller check via `useRef` (prevents React Strict Mode double-fire)
- **Medusa-compliance workflows** (`backend/src/workflows/`):
  - `update-seller.ts`, `update-commission-status.ts`, `approve-seller.ts`,
    `reject-seller.ts`, `suspend-seller.ts`, `approve-payout.ts`,
    `cancel-payout.ts`, `create-payout-request.ts`
- **Dynamic publishable key endpoint** (`backend/src/api/auth/publishable-key/route.ts`):
  - `GET /auth/publishable-key` — returns first active publishable API key token
  - Frontend helper (`frontend/src/lib/medusa-client.ts`) caches key at runtime; no env var needed
- **Global CSS redesign** (`frontend/src/app/globals.css`):
  - Migrated to `@theme` block (Tailwind v4 native)
  - Custom fonts: Work Sans (body), Outfit (headings) via Google Fonts
  - Custom utilities: `shadow-premium`, `bg-mesh`

### Changed

#### Phase 3: Auth & API Updates (April 2026)

- **Login flow switched to Medusa native auth** (`/auth/customer/emailpass`):
  - `LoginForm.tsx` now calls `useAuthStore.login()` which uses Medusa's native token flow
  - Token issued is valid for all `/store/*` authenticated routes including `/store/sellers/me`
  - Removed dependency on legacy custom `/auth/token` route from login form
- **Auth store** (`frontend/src/lib/store/auth-store.ts`):
  - Added `setCredentials(user, token)` action for direct token injection
  - `login()` now uses `POST /auth/customer/emailpass` then `GET /store/customers/me`
  - User shape updated: `id` field, `email_verified` from metadata
- **Middleware** (`backend/src/api/middlewares.ts`):
  - Added coverage for `/store/sellers POST`, `/store/sellers/me*`, `/store/commissions*`, `/store/payouts*`
  - Added coverage for `/admin/sellers*`, `/admin/commissions*`, `/admin/payouts*`
- **CORS** (`backend/medusa-config.ts`):
  - `authCors` broadened to include `http://localhost:3000` and `http://127.0.0.1:3000`
- **`docker-compose.yml`**:
  - Removed `NODE_ENV: development` from frontend service (was causing non-standard Next.js build warnings and prerender failures)
  - Removed `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` env passthrough (auto-resolved at runtime)
- **Auth pages** — `searchParams` changed from `Promise<{...}>` to synchronous `{...}` to allow static generation:
  - `(auth)/login/page.tsx`
  - `(auth)/reset-password/page.tsx`
- **`start.sh`** — Improved idempotent startup: waits for Postgres health, checks schema before running migrations/seed/key creation

### Removed

#### Phase 3: Cleanup (April 2026)

- `backend/src/api/auth/route.ts.old` — obsolete backup file deleted
- `frontend/src/lib/store/api-client.ts` — duplicate helper removed
- `backend/backend/` — orphaned nested directory removed
- `frontend/.next/` and `backend/dist/` — generated artifacts removed from repo

- **Store Mode System** (`backend/src/config/store-mode.ts`): Single environment variable (`STORE_MODE`) controls entire platform behavior
  - `SINGLE_STORE` mode: Regular e-commerce functionality
  - `MULTI_VENDOR_MARKETPLACE` mode: Full multi-vendor features
  - Automatic configuration of 31+ features based on mode
  - Conditional module loading system
- **Custom Medusa Modules** (3 modules):
  - **Seller Module** (`backend/src/modules/seller/`): Vendor management with verification workflow, financial tracking, and payout configuration (23 fields, 10 custom methods)
  - **Commission Module** (`backend/src/modules/commission/`): Per-line-item commission tracking with multi-status workflow (pending → approved → paid)
  - **Payout Module** (`backend/src/modules/payout/`): Seller payout request management with payment provider integration
- **Payment System** (`backend/src/config/payment-config.ts`):
  - Cash on Delivery (COD) with smart restrictions
  - Country-based COD restrictions (configurable whitelist)
  - Domestic-only COD mode option
  - Automatic digital product filtering (no COD for digital goods)
  - Support for Stripe, PayPal, Bank Transfer, and COD
- **Test Infrastructure**:
  - Module registration test script (`backend/src/scripts/test-modules.ts`)
  - Comprehensive test suites for all 3 custom modules (67+ test cases)
  - `backend/src/modules/seller/__tests__/seller.service.spec.ts` (25+ tests)
  - `backend/src/modules/commission/__tests__/commission.service.spec.ts` (20+ tests)
  - `backend/src/modules/payout/__tests__/payout.service.spec.ts` (22+ tests)
- **Documentation**:
  - `.learn/` folder created for organized learning resources
  - `.learn/1_INITIAL_PROJECT_SETUP.md`: Phase 1 complete summary
  - `.learn/2_MULTI_VENDOR_MARKETPLACE_CORE.md`: Phase 2 complete implementation guide
  - `.learn/MEDUSAJS_EXPLAINED.md`: Complete Medusa v2.12.1 guide
  - `.learn/NEXTJS_16_EXPLAINED.md`: Next.js 16 features and patterns
  - `.learn/TAILWINDCSS_4.1_EXPLAINED.md`: Tailwind CSS 4.1 guide
  - `docs/PAYMENT_METHODS.md`: Payment configuration guide
  - `docs/TESTING_GUIDE.md`: Testing instructions for custom modules
  - `docs/STORE_MODE.md`: Store mode configuration guide
  - `STORE_MODE_QUICKSTART.md`: Quick start guide for store mode setup

#### Phase 2.5: Authentication & Authorization (December 5, 2025)

- **JWT Authentication System**:
  - Access tokens (15min expiry) and refresh tokens (7 days expiry)
  - Token generation, verification, and decoding utilities
  - Secure token extraction from Bearer headers
  - `backend/src/auth/jwt.ts` (170 lines, 7 functions, 12 tests)
- **Password Security**:
  - bcrypt hashing with 12 salt rounds
  - Password verification and strength validation
  - Requirements: 8+ chars, uppercase, lowercase, number, special char
  - Secure token generation for email/password reset
  - `backend/src/auth/password.ts` (152 lines, 5 functions, 18 tests)
- **Authentication Middleware**:
  - `authenticate`: JWT verification and user attachment
  - `optionalAuthenticate`: Non-blocking authentication for public/private routes
  - `backend/src/middleware/authenticate.ts` (9 tests)
- **Authorization Middleware**:
  - Role-based access control (RBAC) for buyer, seller, admin roles
  - `authorize`: Factory function for role checking
  - Convenience functions: `requireAdmin`, `requireSeller`, `requireAuthenticated`
  - `backend/src/middleware/authorize.ts` (14 tests)
- **Ownership Verification Middleware**:
  - `checkOwnership`: Ensures sellers only access their own resources
  - `checkOwnershipInBody`: Validates ownership from request body
  - `checkUserOwnership`: User profile ownership verification
  - Automatic admin bypass for all ownership checks
  - `backend/src/middleware/checkOwnership.ts` (16 tests)
- **Authentication Endpoints** (8 routes):
  - `POST /auth/register` - User registration with role selection
  - `POST /auth/login` - Login with JWT token generation
  - `POST /auth/logout` - Token invalidation
  - `POST /auth/refresh` - Access token refresh
  - `GET /auth/me` - Current user information
  - `POST /auth/verify-email` - Email verification
  - `POST /auth/forgot-password` - Password reset request
  - `POST /auth/reset-password` - Password reset with token
  - All endpoints in `backend/src/api/auth/` (28 integration tests)
- **Test Coverage**:
  - JWT utilities: 12 tests
  - Password utilities: 18 tests
  - Authentication middleware: 9 tests
  - Authorization middleware: 14 tests
  - Ownership middleware: 16 tests
  - Auth API integration: 28 tests
  - **Total: 97 new tests, all passing (106 tests total)**
- **Dependencies Added**:
  - jsonwebtoken (9.0.3) for JWT token management
  - bcrypt (6.0.0) for password hashing
  - @types/jsonwebtoken and @types/bcrypt
- **Configuration**:
  - `JWT_REFRESH_SECRET` added to `.env.example`
  - Vitest setup file for test environment (`vitest.setup.ts`)
  - Updated vitest config to use setup file

#### Phase 2: Refinements (December 5, 2025)

- **API Layer** (20 endpoints):
  - 7 store endpoints (seller registration, commissions, payouts)
  - 13 admin endpoints (seller management, approvals, payouts)
  - Complete CRUD operations for all modules
  - Pagination, filtering, and search support
- **Module Links** (`backend/src/config/module-links.ts`):
  - Cross-module relationships without tight coupling
  - Seller ↔ Customer, Commission ↔ Seller, Commission ↔ Order, Payout ↔ Seller
- **Validation Layer** (`backend/src/services/seller-validation.ts`):
  - Input validation for all operations
  - Business rule validation
  - Format and constraint checking
- **Audit Logging System**:
  - Immutable audit trail model (`backend/src/models/audit-log.ts`)
  - Audit service with 9+ event types (`backend/src/services/audit-service.ts`)
  - Compliance-ready tracking for all operations
- **Business Rules Engine** (`backend/src/services/business-rules.ts`):
  - Payout rules (min/max amounts, frequency limits)
  - Commission rules (rate validation, category/seller overrides)
  - Seller rules (verification, suspension, ratings)
  - Risk scoring and fraud detection
- **Event Subscribers** (`backend/src/subscribers/order-placed.ts`):
  - Order placement event handler
  - Framework for automatic commission creation
  - Ready for Phase 3 workflow integration

#### Phase 1: Initial Setup

- Initial project setup and planning documentation
- Comprehensive implementation plan with 10 modular phases
- Database schema design for multi-vendor marketplace
- System architecture documentation
- Features checklist with 300+ tracked features
- Project context and requirements documentation
- Contributing guidelines and code of conduct
- MIT License
- Docker setup with docker-compose.yml for PostgreSQL, Redis, Backend, Frontend
- Dockerfiles for backend and frontend with pnpm support via corepack
- Makefile with helper commands for common tasks
- start.sh script for one-command setup
- backend/package.json with Medusa.js dependencies
- backend/medusa-config.ts with v2 configuration using defineConfig()
- @medusajs/workflows-sdk dependency for workflow engine
- Redis modules configured (cache, event-bus, workflow-engine)
- frontend/package.json with Next.js 16.0.5, React 19.2.0, Tailwind 4.1.17
- frontend/postcss.config.mjs with @tailwindcss/postcss plugin for v4.1
- DEVELOPMENT_STANDARDS.md explaining package management and latest version policy
- PACKAGE_MANAGER.md explaining pnpm usage with visual examples
- AI instructions in .ai/instructions.md with package management rules
- .gitignore entries for .personal folder

### Changed

#### Phase 2: Updates (December 4, 2025)
- **Updated all Medusa packages to v2.12.1** (from v2.11.3):
  - @medusajs/medusa: 2.12.1
  - @medusajs/framework: 2.12.1
  - @medusajs/utils: 2.12.1
  - @medusajs/types: 2.12.1 (newly added)
  - @medusajs/cli: 2.12.1
  - @medusajs/caching-redis: 2.12.1
  - @medusajs/test-utils: 2.12.1
- **TypeScript Configuration** (`backend/tsconfig.json`):
  - Changed module resolution to "node16" (required for @medusajs/types)
  - Updated module to "Node16"
- **Module Configuration** (`backend/medusa-config.ts`):
  - Changed modules from object to array structure
  - Added conditional module loading based on store mode
  - Fixed module key format (underscores only: `event_bus_redis`, `cache_redis`)
- **Environment Variables** (`backend/.env.example`):
  - Added STORE_MODE configuration
  - Added COD payment method variables
  - Added domestic country configuration

#### Phase 1: Updates
- Migrated from npm to pnpm as package manager
- Updated all package versions to latest from npm registry (verified with `npm view`)
- Backend scripts simplified to Medusa v2 commands (medusa build, medusa develop)
- Backend now uses Medusa.js v2 with module-first architecture
- Backend configuration changed from medusa-config.js to medusa-config.ts
- Redis now required for events, workflows, and cache in v2
- Replaced Jest with Vitest for testing
- Frontend uses Next.js 16.0.5 with Turbopack (stable)
- Frontend uses React 19.2.0 with new Actions and use() hook
- Tailwind CSS 4.1.17 with single @import "tailwindcss" syntax
- PostCSS plugin changed to @tailwindcss/postcss
- globals.css updated from @tailwind directives to @import
- All TypeScript updated to 5.9.3
- Docker configuration to use pnpm instead of npm
- Makefile commands updated to use pnpm
- start.sh script updated to check for pnpm-lock.yaml
- README.md updated with v2 setup instructions

### Removed
- npm and yarn lock files (using pnpm-lock.yaml only)
- Temporary summary files moved to `.learn/` folder:
  - COD_FEATURE_ADDED.md → .learn/
  - CORRECTIONS_APPLIED.md → .learn/
  - PHASE_2_COMPLETE.md → .learn/
  - VERIFICATION_COMPLETE.md → .learn/
- Monorepo structure (packages folder, pnpm-workspace.yaml, root package.json)
- Babel dependencies (no longer needed in Medusa v2)
- cross-env dependency (handled internally by Medusa v2)
- Jest and related test dependencies (replaced with Vitest)
- autoprefixer from frontend (built-in to Tailwind 4.1)
- Old TypeORM references (Medusa v2 uses MikroORM)

### Fixed

- N/A (Phase 2 implementation corrections documented in "Changed" section above)

### Security
- All packages updated to latest versions for security patches
- Configured strict pnpm mode to prevent phantom dependencies

---

## How to Update This File

When you make changes:

1. Add changes under the **[Unreleased]** section
2. Use the categories: Added, Changed, Deprecated, Removed, Fixed, Security
3. When releasing a version, move items from Unreleased to a new version section
4. Format: `## [Version] - YYYY-MM-DD`

Example:
```markdown
## [1.0.0] - 2024-12-01

### Added
- Initial MVP release
- Multi-vendor marketplace functionality
- Commission system
```
