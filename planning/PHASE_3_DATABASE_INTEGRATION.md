# Phase 3: Database Integration & User Management

**Objective:** Integrate the authentication system with Medusa's built-in User/Customer modules and database.

**Status:** ✅ Complete (Backend authentication fully integrated with database and Redis)

---

## 🎯 Progress Summary

### ✅ Completed (as of 2025-12-11)

**Phase 3.1 - Database Schema Extensions:**
- Extended `user` table with 7 custom columns (role, email_verified, failed_login_attempts, locked_until, last_login_at, seller_id)
- Extended `customer` table with 5 custom columns (email_verified, failed_login_attempts, locked_until, last_login_at)
- All columns and indexes created successfully via Docker SQL migration

**Phase 3.2 - Account Module:**
- Created `email_verification` and `password_reset` models using Medusa DML
- Implemented AccountModuleService with token management methods
- Generated and ran database migrations (Migration20251211080247)
- Registered module in medusa-config.ts
- 19 unit tests passing ✅

**Phase 3.3 - Authentication Endpoints:**
- `/api/auth/register` - Now creates customers via Medusa Customer Module + Auth Module
- `/api/auth/login` - Authenticates using Medusa Auth Module (emailpass provider)
- `/api/auth/verify-email` - Verifies email using database tokens from Account Module
- `/api/auth/forgot-password` - Creates password reset tokens with 15-min expiry
- `/api/auth/reset-password` - Resets password via Medusa Auth Module + Account Module

**Phase 3.4 - Redis Integration:**
- Created RedisTokenStore class with 8 methods for token lifecycle management
- `/api/auth/login` - Stores refresh tokens in Redis with 7-day expiry
- `/api/auth/refresh` - Validates tokens against Redis before refreshing
- `/api/auth/logout` - Revokes refresh tokens from Redis
- `/api/auth/reset-password` - Revokes all user tokens on password change

### ⏳ Pending

- **Frontend Pages** - Update to use database-backed authentication
- **Full Stack Testing** - Integration and E2E tests
- **Email Service** - Integrate email sending for verification and reset emails

---

## Discovery: Medusa v2 User Architecture

After researching Medusa v2's authentication system, we discovered that **Medusa already provides User/Customer/Auth modules**. We don't need to create a custom User module.

### Medusa's Built-in Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user` | Admin/staff users | id, first_name, last_name, email, avatar_url, metadata |
| `customer` | Buyers/customers | id, first_name, last_name, email, phone, has_account, metadata |
| `auth_identity` | Authentication identity | id, app_metadata |
| `provider_identity` | Provider-specific auth | id, entity_id, provider, auth_identity_id, user_metadata, provider_metadata |

### How Medusa Authentication Works

1. **Auth Module** - Provides `emailpass`, Google, GitHub providers
2. **Provider Identity** - Stores provider-specific data (password hash in `provider_metadata` for emailpass)
3. **User** - Admin users (staff, managers)
4. **Customer** - Buyers (with optional account via `has_account` flag)

### Our Multi-Vendor Mapping

For our marketplace, we need to map roles to Medusa's structure:

- **Buyers** → `customer` table (existing)
- **Sellers** → `seller` table (custom module) + link to `user`
- **Admin** → `user` table (existing)

---

## Phase 3 Revised Plan

### 3.1: Extend User/Customer Tables with Custom Columns

**Decision:** Add actual database columns instead of using metadata.

We'll create database migrations to extend Medusa's tables:

**Extend `user` table:**
```sql
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'admin';
ALTER TABLE "user" ADD COLUMN "email_verified" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "email_verified_at" timestamp with time zone;
ALTER TABLE "user" ADD COLUMN "failed_login_attempts" integer DEFAULT 0;
ALTER TABLE "user" ADD COLUMN "locked_until" timestamp with time zone;
ALTER TABLE "user" ADD COLUMN "last_login_at" timestamp with time zone;
ALTER TABLE "user" ADD COLUMN "seller_id" text;  -- Link to seller module

CREATE INDEX "IDX_user_role" ON "user" ("role");
CREATE INDEX "IDX_user_locked_until" ON "user" ("locked_until") WHERE locked_until IS NOT NULL;
```

**Extend `customer` table:**
```sql
ALTER TABLE "customer" ADD COLUMN "email_verified" boolean DEFAULT false;
ALTER TABLE "customer" ADD COLUMN "email_verified_at" timestamp with time zone;
ALTER TABLE "customer" ADD COLUMN "failed_login_attempts" integer DEFAULT 0;
ALTER TABLE "customer" ADD COLUMN "locked_until" timestamp with time zone;
ALTER TABLE "customer" ADD COLUMN "last_login_at" timestamp with time zone;

CREATE INDEX "IDX_customer_locked_until" ON "customer" ("locked_until") WHERE locked_until IS NOT NULL;
```

**Why columns instead of metadata:**
- ✅ Database indexes for fast queries
- ✅ Type safety and validation
- ✅ Standard SQL operations
- ✅ Better performance
- ✅ Clearer schema

### 3.2: Create Helper Services for User/Customer Management

Create wrapper services that abstract Medusa's User/Customer modules:

```
backend/src/modules/account/
├── index.ts
├── service.ts
├── models/
│   ├── email-verification.ts
│   └── password-reset.ts
└── __tests__/
    └── account.service.spec.ts
```

**AccountModuleService** will provide:
- `createBuyer(email, password, firstName, lastName)` → Creates customer + auth_identity
- `createSeller(email, password, firstName, lastName, sellerData)` → Creates user + seller + auth_identity
- `createAdmin(email, password, firstName, lastName)` → Creates user + auth_identity
- `findByEmail(email)` → Finds user or customer by email
- `updateRole(userId, role)` → Updates metadata.role
- `incrementFailedAttempts(userId)` → Track failed logins in metadata
- `lockAccount(userId, duration)` → Set metadata.locked_until
- `isAccountLocked(userId)` → Check if account is locked
- Email verification token management
- Password reset token management

### 3.3: Update Backend Authentication Endpoints

Update Phase 2.5 authentication endpoints to use:
1. Medusa's Auth Module for password verification
2. AccountModuleService for user management
3. Database for token storage (replace in-memory)

**Backend Files to Update:**
- `backend/src/api/auth/register/route.ts`
- `backend/src/api/auth/login/route.ts`
- `backend/src/api/auth/verify-email/route.ts`
- `backend/src/api/auth/forgot-password/route.ts`
- `backend/src/api/auth/reset-password/route.ts`
- `backend/src/api/auth/refresh/route.ts`
- `backend/src/api/auth/logout/route.ts`

### 3.4: Update Frontend Authentication Pages

Update Phase 2.5 frontend pages to handle database-backed authentication:

**Frontend Files to Update:**
- `frontend/src/app/(auth)/register/page.tsx` - Handle database validation errors
- `frontend/src/app/(auth)/login/page.tsx` - Show account locked messages
- `frontend/src/app/(auth)/verify-email/page.tsx` - Use database verification tokens
- `frontend/src/app/(auth)/forgot-password/page.tsx` - Request password reset
- `frontend/src/app/(auth)/reset-password/page.tsx` - Confirm password reset
- `frontend/src/contexts/AuthContext.tsx` - Handle database sessions
- `frontend/src/lib/auth.ts` - Update API calls for database backend

**New Features to Add:**
- Loading states during database operations
- Error handling for network/database failures
- Account locked notification (15 minutes remaining)
- Email verification reminder
- Session expiration handling
- Auto-logout on token expiration

### 3.5: Integrate Redis for Refresh Token Storage

Replace in-memory refresh token storage with Redis.

**Implementation:**
```typescript
// backend/src/lib/redis-token-store.ts
class RedisTokenStore {
  async storeRefreshToken(userId: string, token: string, expiresIn: number)
  async getRefreshToken(userId: string): Promise<string | null>
  async revokeRefreshToken(userId: string)
  async revokeAllUserTokens(userId: string)
}
```

### 3.6: Full Stack Testing

1. Backend unit tests (Account module, Redis store)
2. Backend integration tests (API endpoints with database)
3. Frontend component tests (forms, pages)
4. End-to-end tests (complete user journeys)
5. Performance testing (database queries, Redis operations)
6. Security testing (token validation, account locking)

---

## Sub-Tasks Breakdown

### Task 1: Create Custom Migrations to Extend User/Customer Tables ✅
- [x] Create migration file to extend `user` table with custom columns
- [x] Create migration file to extend `customer` table with custom columns
- [x] Run migrations
- [x] Verify columns added in PostgreSQL

### Task 2: Create Account Module ✅
- [x] Create `backend/src/modules/account/` directory
- [x] Define EmailVerification model
- [x] Define PasswordReset model
- [x] Create AccountModuleService
- [x] Register module in `medusa-config.ts`
- [x] Write tests

### Task 3: Generate Migrations for Account Module ✅
- [x] Generate migrations for Account module (email_verification, password_reset)
- [x] Run migrations
- [x] Verify tables created in PostgreSQL

### Task 4: Update Backend Authentication Endpoints ✅ (Partial - Redis pending)
- [x] Update `/api/auth/register` to use Account module
- [x] Update `/api/auth/login` to use Medusa Auth + Account module
- [x] Update `/api/auth/verify-email` to use database tokens
- [x] Update `/api/auth/forgot-password` to use database tokens
- [x] Update `/api/auth/reset-password` to use database tokens
- [ ] Update `/api/auth/refresh` to use Redis (TODO: Next phase)
- [ ] Update `/api/auth/logout` to revoke Redis tokens (TODO: Next phase)

### Task 5: Update Frontend Authentication Pages
- [ ] Update registration page to handle database errors
- [ ] Update login page to show account locked messages
- [ ] Update email verification page to use database tokens
- [ ] Update password reset flow (request + reset pages)
- [ ] Add loading states during database operations
- [ ] Add error handling for network failures
- [ ] Update auth context to handle database sessions

### Task 6: Redis Integration
- [ ] Create RedisTokenStore class
- [ ] Implement token storage methods
- [ ] Update refresh endpoint to use Redis
- [ ] Add token revocation on logout
- [ ] Add tests for Redis token store

### Task 7: Testing (Backend + Frontend)

**Backend Tests:**
- [ ] Update unit tests for Account module
- [ ] Write integration tests for auth endpoints with database
- [ ] Test email verification flow (backend)
- [ ] Test password reset flow (backend)
- [ ] Test account locking after failed attempts
- [ ] Test token refresh with Redis
- [ ] Test logout token revocation

**Frontend Tests:**
- [ ] Test registration form submission
- [ ] Test login form with correct/incorrect credentials
- [ ] Test account locked UI display
- [ ] Test email verification page
- [ ] Test password reset request and confirmation
- [ ] Test protected route access with database sessions
- [ ] Test auto-logout on token expiration

**End-to-End Tests:**
- [ ] Complete user journey: Register → Verify Email → Login → Access Protected Page
- [ ] Complete seller journey: Register as Seller → Verify Email → Login → Access Seller Dashboard
- [ ] Password reset journey: Request Reset → Receive Email → Reset Password → Login
- [ ] Failed login journey: Fail 5 times → Account Locked → Wait 15 min → Login Success

---

## Technical Decisions

### Why Add Columns Instead of Using Metadata?

**Pros of Columns:**
- ✅ Database indexes for fast queries on `role`, `locked_until`
- ✅ Type safety and constraints at database level
- ✅ Standard SQL operations (WHERE, ORDER BY, etc.)
- ✅ Better query performance
- ✅ Clearer schema definition

**Cons of Columns:**
- Requires database migrations
- Changes to Medusa's core tables

**Decision:** Add columns via migrations. The performance and type safety benefits outweigh the migration complexity.

### Why Create Account Module?

We need custom tables for:
1. **Email Verification Tokens** - Not provided by Medusa
2. **Password Reset Tokens** - Not provided by Medusa

These should be in their own module for separation of concerns.

### Why Use Medusa's Auth Module?

Medusa's Auth Module provides:
- Secure password hashing
- Multiple provider support (emailpass, Google, GitHub)
- JWT token generation
- Session management

We should leverage this instead of reimplementing.

---

## Expected Outcomes

After Phase 3:

**Backend:**
- ✅ `user` and `customer` tables extended with custom columns
- ✅ Authentication integrated with Medusa's User/Customer tables
- ✅ Buyer/Seller/Admin roles managed via `role` column with indexes
- ✅ Email verification stored in database (`email_verification` table)
- ✅ Password reset stored in database (`password_reset` table)
- ✅ Refresh tokens stored in Redis (persistent)
- ✅ Account locking after failed attempts (using `locked_until` column)
- ✅ All 106 Phase 2.5 backend tests still passing
- ✅ New integration tests with database

**Frontend:**
- ✅ Registration/Login pages connected to database backend
- ✅ Email verification flow working with database tokens
- ✅ Password reset flow working with database tokens
- ✅ Account locked messages displayed to users
- ✅ Loading states during database operations
- ✅ Proper error handling for network/database failures
- ✅ Protected routes working with database sessions
- ✅ Auto-logout on token expiration

**Full Stack:**
- ✅ Complete authentication flows tested end-to-end
- ✅ No in-memory storage (all data in PostgreSQL/Redis)
- ✅ Production-ready authentication system

---

## Migration from Phase 2.5

Phase 2.5 implemented in-memory authentication. Here's how we migrate:

| Phase 2.5 (In-Memory) | Phase 3 (Database) |
|-----------------------|--------------------|
| `users` Map | `customer` / `user` tables |
| `refreshTokens` Map | Redis |
| `emailVerificationTokens` Map | `email_verification` table |
| `passwordResetTokens` Map | `password_reset` table |
| Custom User type | Medusa's User/Customer + metadata |

---

## Testing Strategy

### Unit Tests
- Account module service methods
- RedisTokenStore methods
- Token generation/validation

### Integration Tests
- Complete registration flow (create customer + auth_identity)
- Complete login flow (verify password, generate tokens)
- Email verification (create token, verify token, mark as verified)
- Password reset (request token, verify token, update password)
- Account locking (5 failed attempts, lock for 15 minutes)
- Token refresh (use Redis)
- Logout (revoke Redis token)

### End-to-End Tests
- Register as buyer → verify email → login
- Register as seller → verify email → login → access seller endpoints
- Forgot password → reset password → login with new password
- Failed login 5 times → account locked → wait 15 min → login succeeds

---

## Risk Mitigation

### Risk 1: Breaking Phase 2.5 Tests
**Mitigation:** Keep all Phase 2.5 tests passing by maintaining the same API contracts.

### Risk 2: Medusa Auth Module Complexity
**Mitigation:** Start with emailpass provider only. Add Google/GitHub later if needed.

### Risk 3: Data Migration for Existing Users
**Mitigation:** No existing users yet (development phase), so no migration needed.

---

## Next Steps

1. Create custom migrations to extend `user` and `customer` tables
2. Run migrations to add columns
3. Create Account module (EmailVerification and PasswordReset models)
4. Write AccountModuleService
5. Generate and run Account module migrations
6. Update authentication endpoints one by one
7. Integrate Redis token store
8. Run all tests

---

## Resources

- [Medusa Auth Module Docs](https://docs.medusajs.com/resources/commerce-modules/auth)
- [Medusa User Module](https://docs.medusajs.com/resources/commerce-modules/user)
- [Medusa Customer Module](https://docs.medusajs.com/resources/commerce-modules/customer)

---

**Phase 3 Goal:** Fully integrate authentication with Medusa's built-in modules and database.

**Success Criteria:**
- All authentication flows use database (no in-memory storage)
- All 106 Phase 2.5 tests still pass
- Integration tests with database pass
- Redis stores refresh tokens
- Email verification and password reset work with database
