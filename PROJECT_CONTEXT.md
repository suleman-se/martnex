# Project Context & Requirements

## Project Name
Martnex - Next-Generation Multi-Vendor Marketplace Platform

## Current Status
- **Version:** 0.2.0
- **Phase:** 2.5 Complete (Authentication & Authorization)
- **Phase 3:** Ready to Start (Database Integration & Product Linking)
- **Test Coverage:** 106 tests (all passing ✅)
- **Last Updated:** December 8, 2025

## Objective
Build a scalable, secure multi-vendor marketplace with custom commission logic, role-based access, and comprehensive e-commerce features using Medusa.js as the foundation.

## Why Medusa.js?
- **Stack Match:** Node.js + React/Next.js (exactly what we need)
- **MIT License:** Full code ownership, zero restrictions
- **Time Savings:** 60-70% reduction in development time
- **Built-in Features:** Product catalog, cart, checkout, payments, admin dashboard
- **Customizable:** Modular architecture allows custom extensions
- **Current Version:** Medusa.js v2.12.1 with module-first architecture

## User Roles

### 1. Buyer
- Browse and search products
- Add items to cart
- Secure checkout with multiple payment options
- Track orders
- Leave reviews and ratings
- Anonymous order option
- Receive notifications (email/SMS)

### 2. Seller
- Register as seller
- Manage products (CRUD operations)
- View sales dashboard
- Track earnings and commissions
- Manage orders
- Handle disputes
- View analytics and reports
- Receive payout notifications

### 3. Admin
- Manage all users (buyers/sellers)
- Oversee all products and orders
- Configure commission rates
- Handle disputes
- View comprehensive reporting dashboard
- Manage platform settings
- Access role-based controls

## Core Features Completed

### Authentication & Authorization ✅ (Phase 2.5 Complete)
- JWT-based authentication (access + refresh tokens: 15min/7days)
- Role-based access control (RBAC): buyer, seller, admin
- Secure password handling (bcrypt with 12 salt rounds)
- Email verification endpoints (token generation ready)
- Password reset functionality (token generation ready)
- Resource ownership verification middleware
- 97 comprehensive tests (all passing)
- 8 authentication endpoints (register, login, logout, refresh, me, verify-email, forgot-password, reset-password)
- Middleware layer (authenticate, authorize, checkOwnership)
- Integration with Medusa's HTTP API patterns

### Multi-Vendor Core ✅ (Phase 2 Complete)
- **3 Custom Medusa Modules** with MedusaService CRUD:
  - Seller Module: Vendor management, verification workflow, financial tracking
  - Commission Module: Per-line-item commission tracking with multi-status workflow
  - Payout Module: Seller payout request management
- **Store Mode System**: Single environment variable controls entire platform behavior
  - SINGLE_STORE mode: Regular e-commerce
  - MULTI_VENDOR_MARKETPLACE mode: Full multi-vendor features
  - Automatic configuration of 31+ features based on mode
- **9 Passing Unit Tests** (3 per module: seller, commission, payout)

### API Layer & Business Rules ✅ (Phase 2 Complete)
- **20 Production-Ready API Endpoints**:
  - 7 store endpoints (seller registration, commissions, payouts)
  - 13 admin endpoints (seller management, approvals, payout processing)
- **Module Links** for cross-module relationships without tight coupling
- **Validation Layer** (8+ validators for all operations)
- **Audit Logging System** (9+ event types for compliance)
- **Business Rules Engine** (12+ rules for payout/commission/seller constraints)
- **Event Subscribers** (order.placed handler framework)

### Payment Methods ✅ (Phase 2 Complete)
- Stripe, PayPal, Bank Transfer, Cash on Delivery
- Country-based COD restrictions
- Automatic digital product filtering
- Payment provider integration ready

## Technical Stack

### Frontend
- **Framework:** Next.js 16.0.5 (App Router with Turbopack)
- **UI Library:** React 19.2.0
- **Styling:** TailwindCSS 4.1.17
- **State Management:** React Context / Zustand
- **Forms:** React Hook Form + Zod validation
- **HTTP Client:** Medusa JS SDK 2.12.1
- **TypeScript:** 5.9.3

### Backend
- **Framework:** Medusa.js v2.12.1 (module-first architecture)
- **Runtime:** Node.js 18+
- **API:** REST (Medusa HTTP API patterns)
- **Authentication:** JWT (access + refresh tokens)
- **Password Security:** bcrypt (12 salt rounds)
- **Database ORM:** Medusa's MikroORM integration
- **Module System:** 3 custom modules (Seller, Commission, Payout)
- **TypeScript:** 5.9.3 (strict mode)
- **Testing:** Vitest 2.1.8 with 106 passing tests

### Database
- **Primary:** PostgreSQL 15+
- **ORM:** MikroORM (via Medusa framework)
- **Caching:** Redis 7+ (cache, events, workflows)
- **Package Manager:** pnpm 10.24.0 (enforced)

### Key Dependencies
- `@medusajs/framework` (2.12.1): Core framework
- `@medusajs/medusa` (2.12.1): Medusa modules
- `@medusajs/utils` (2.12.1): Utilities (NOT @medusajs/framework/utils)
- `jsonwebtoken` (9.0.3): JWT token management
- `bcrypt` (6.0.0): Password hashing
- `redis` (4.7.0): Caching and event bus
- `pg` (8.13.3): PostgreSQL driver
- `express` (4.21.2): HTTP server

### Infrastructure
- **Containers:** Docker + docker-compose
- **Local Dev:** PostgreSQL, Redis, Backend, Frontend services
- **Payment Processing:** Stripe Connect, PayPal, Bank Transfer ready

## Development Timeline

### Phase 1: Initial Setup ✅ (December 2, 2025)
**Status:** Complete
- Project structure and configuration
- Docker setup
- Environment configuration
- Documentation foundation
- Feature flags system

### Phase 2: Multi-Vendor Core ✅ (December 4, 2025)
**Status:** Complete
- Seller module (vendor management)
- Commission module (commission tracking)
- Payout module (payout management)
- Store mode system (single/multi-vendor)
- Payment methods support
- Unit tests (9 passing)

### Phase 2 Refinements: API Layer & Business Rules ✅ (December 5, 2025)
**Status:** Complete
- 20 REST API endpoints (store + admin)
- Module links configuration
- Validation layer (8+ validators)
- Audit logging system (9+ events)
- Business rules engine (12+ rules)
- Event subscribers framework

### Phase 2.5: Authentication & Authorization ✅ (December 5-8, 2025)
**Status:** Complete
- JWT authentication system (access + refresh tokens)
- Password security (bcrypt + strength validation)
- Role-based access control (RBAC)
- Resource ownership verification
- 8 authentication endpoints
- 97 comprehensive tests (all passing)

### Phase 3: Database Integration & Product Linking 📋 (Pending)
**Status:** Ready to Start
- User model creation and integration
- Email verification token storage and sending
- Password reset token storage
- Refresh token storage (Redis)
- Email service integration (SendGrid)
- Product model with seller mapping
- Product-seller relationship
- Order event automation (commission creation)
- Complete integration testing

### Phase 4+: Frontend & Advanced Features 📋 (Future)
- Buyer/Seller/Admin dashboards
- Product management UI
- Order management UI
- Reporting and analytics
- Advanced features (disputes, returns, etc.)

## Current Implementation Status

### What's Built & Ready for Use

**Backend Infrastructure:**
- ✅ Medusa.js v2.12.1 core setup
- ✅ 3 custom modules (Seller, Commission, Payout) with CRUD
- ✅ Store mode configuration system (31+ auto-configured features)
- ✅ Payment methods (Stripe, PayPal, Bank Transfer, COD)
- ✅ 20 production-ready API endpoints
- ✅ JWT authentication and authorization
- ✅ Role-based access control (buyer, seller, admin)
- ✅ Resource ownership verification
- ✅ Validation layer with business rules
- ✅ Audit logging system
- ✅ Event subscriber framework
- ✅ Module links for cross-module relationships

**Testing:**
- ✅ 106 tests (all passing)
- ✅ Unit tests for all 3 modules
- ✅ Integration tests for auth endpoints
- ✅ Utility tests for JWT, password, middleware

**Documentation:**
- ✅ Phase learning guides (1_INITIAL, 2_CORE, 2.5_AUTH)
- ✅ Technical guides (Medusa, Next.js, Tailwind)
- ✅ Payment methods documentation
- ✅ Testing guides
- ✅ Store mode quick start
- ✅ CHANGELOG with all features
- ✅ Security guidelines

### What Requires Database Integration (Phase 3)

**Critical - Database Models Needed:**
- User model (currently endpoints use mock data)
- Email verification tokens table
- Password reset tokens table
- Refresh token storage (Redis)

**Email Services:**
- Email verification sending
- Password reset email sending
- Order confirmation emails
- Payout notification emails

**Product Integration:**
- Product model modification (add seller_id)
- Product-seller relationship setup
- Product filtering by seller
- Inventory per seller

**Order Processing:**
- Full order.placed event workflow
- Automatic commission creation on orders
- Order status updates and notifications

**Actual Payment Processing:**
- Stripe Connect integration
- PayPal seller disbursement
- Bank transfer settlement
- COD order handling

## Security Requirements
- HTTPS everywhere
- CSRF protection
- XSS prevention
- SQL injection prevention (via ORM)
- Rate limiting
- Input validation and sanitization
- Secure payment processing (PCI compliance)
- Regular security audits

## Performance Requirements
- Page load time < 3 seconds
- API response time < 500ms
- Support 1000+ concurrent users
- Image optimization (WebP, lazy loading)
- Code splitting
- Server-side rendering (SSR) for SEO

## Security Implementation

### Completed ✅
- JWT-based authentication with short-lived access tokens (15 min)
- bcrypt password hashing with 12 salt rounds
- Role-based access control (RBAC) for buyer, seller, admin
- Resource ownership verification (sellers can only access own data)
- Strong password requirements (8+ chars, upper, lower, number, special)
- Token rotation pattern for refresh tokens
- Secure token generation for email/password reset
- Input validation at all API layers
- Authorization middleware on protected routes
- Audit logging for compliance

### Still Required (Phase 3+)
- Email service for email verification (SendGrid integration)
- Rate limiting on auth endpoints
- HTTPS in production
- CORS configuration hardening
- CSP (Content Security Policy) headers
- SQL injection prevention (via ORM)
- XSS protection (via React/Next.js defaults)
- CSRF protection on state-changing operations
- Secure payment processing (PCI compliance)
- Regular security audits and dependency updates

## Performance Targets

- API response time: <500ms (currently <100ms)
- Page load time: <3 seconds
- Pagination support: 50 items default, 1000 max per page
- Database query optimization: Indexes on frequently queried fields
- Caching: Redis for sessions, cart, and generated content
- Image optimization: Lazy loading and WebP support (frontend phase)
- Code splitting: Implemented in Next.js 16
- Rate limiting framework: Ready for Phase 3

## Success Metrics

✅ **Completed:**
- Platform architecture supports multiple sellers
- Commission system has business rules engine with 12+ rules
- All three user roles (buyer, seller, admin) have endpoints
- Authentication system is secure and production-ready
- Code is well-documented with 106 passing tests

📋 **Pending (Phase 3):**
- Actual database integration with user model
- Email verification and password reset functionality
- Product-to-seller mapping
- Complete order-to-commission workflow
- Real payment processing (Stripe, PayPal, etc.)
- Frontend dashboards for all user roles

## Architecture Philosophy

**"Give users the banana, not the monkey holding the banana"**

- Users only get features they enable
- No forced dependencies
- Each module is independently useful
- Features can be toggled via environment variables
- Modular design allows selective feature adoption

**Medusa v2.12.1 Design Patterns:**
- Module-first architecture (Seller, Commission, Payout modules)
- MedusaService for auto-generated CRUD operations
- Data Model Language (DML) instead of decorators
- Event-driven architecture with subscribers
- Module Links for cross-module relationships
- HTTP API patterns for REST endpoints

## Development Approach

**Open-Source & Community-Driven:**
- Free to use, modify, and distribute (MIT License)
- Work incrementally at your own pace
- No strict deadlines; build as time permits
- Phases can be completed independently
- Well-organized, modular implementation

**Code Quality Standards:**
- TypeScript strict mode throughout
- Comprehensive test coverage (currently 106 tests)
- JSDoc documentation on all functions
- Consistent code formatting (ESLint + Prettier)
- Clear commit messages with meaningful granularity
- Semantic versioning (currently v0.2.0)

## Budget Considerations

**Fixed Costs:**
- Open-source foundation = $0 licensing
- Medusa.js = Free, MIT license
- Next.js = Free

**Variable Costs:**
- Email service (SendGrid): ~$10-20/month
- SMS service (Twilio): ~$0.01 per message (optional)
- File storage (AWS S3 / Cloudinary): ~$0.025 per GB
- Monitoring (Sentry): $29/month (free tier available)

**Deployment Costs:**
- Frontend (Vercel): Free tier available, $20+/month for production
- Backend (Railway/DigitalOcean): ~$50-100/month
- Database (managed PostgreSQL): ~$50-200/month
- Redis: Included in most managed services

**Total Estimate:** $150-400/month in production

## Dependencies & Maintenance

**Package Manager:** pnpm (enforced via packageManager field)
- Faster, more reliable than npm/yarn
- Lock file committed for reproducibility
- Version policy: Always use latest stable versions from npm registry

**Dependency Updates:**
- Security patches applied immediately
- Minor/patch updates checked monthly
- Major version upgrades evaluated carefully
- Medusa.js currently at 2.12.1 (latest)

## Next Immediate Actions (Phase 3)

1. **Create User Model** - Medusa DML model in user module
2. **Database Integration** - Wire up authentication endpoints to real database
3. **Email Service** - Integrate SendGrid for email verification and password reset
4. **Product Integration** - Add seller_id to products, create product-seller mapping
5. **Order Automation** - Implement full order.placed → commission creation workflow
6. **Integration Testing** - Test all endpoints with real database
7. **Frontend Foundation** - Begin Next.js frontend development
