# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Phase 3 (April 2026)

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
