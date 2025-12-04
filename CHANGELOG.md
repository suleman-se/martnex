# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Phase 2: Multi-Vendor Marketplace Core (December 4, 2025)

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
  - `.learn/MEDUSA_V2.12_COMPLETE_GUIDE.md`: Comprehensive 500+ line guide covering all Medusa v2.12.1 patterns, errors, and solutions
  - `.learn/PHASE_2_IMPLEMENTATION_SUMMARY.md`: Complete Phase 2 summary with architecture, bugs fixed, and metrics
  - `.learn/NEXTJS_16_EXPLAINED.md`: Next.js 16 features and patterns
  - `.learn/TAILWINDCSS_4.1_EXPLAINED.md`: Tailwind CSS 4.1 guide
  - `docs/PAYMENT_METHODS.md`: Payment configuration guide
  - `docs/TESTING_GUIDE.md`: Testing instructions for custom modules
  - `docs/STORE_MODE.md`: Store mode configuration guide
  - `STORE_MODE_QUICKSTART.md`: Quick start guide for store mode setup

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
