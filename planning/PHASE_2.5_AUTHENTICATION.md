# Phase 2.5: Authentication & Authorization

**Start Date**: December 5, 2025
**Status**: 📋 Planned
**Prerequisites**: Phase 2 Complete ✅

---

## Overview

Phase 2.5 adds the missing authentication and authorization layer to secure all API endpoints created in Phase 2. This is a critical security foundation that enables role-based access control (RBAC) for Buyers, Sellers, and Admins.

**Why Phase 2.5?**
Phase 2 built the core modules and API endpoints, but they're currently unprotected. This phase adds the security layer without modifying existing code - just wrapping it with middleware.

---

## Goals

1. ✅ **Secure all API endpoints** with JWT authentication
2. ✅ **Implement role-based access control** (Buyer/Seller/Admin)
3. ✅ **Add session management** for logged-in users
4. ✅ **Password security** with bcrypt hashing
5. ✅ **Email verification** flow for new users
6. ✅ **Token refresh** mechanism

---

## What Will Be Built

### 1. JWT Authentication System

**Files to Create**:
- `backend/src/auth/jwt.ts` - Token generation/validation
- `backend/src/auth/password.ts` - Password hashing with bcrypt
- `backend/src/middleware/authenticate.ts` - JWT middleware
- `backend/src/middleware/authorize.ts` - Role-based middleware

**Features**:
- Generate JWT tokens on login
- Validate tokens on protected routes
- Token expiration (15min access, 7d refresh)
- Refresh token rotation
- Blacklist for revoked tokens

### 2. Role-Based Access Control (RBAC)

**Roles**:
| Role | Access Level | Example Routes |
|------|--------------|----------------|
| **Buyer** | Can browse, purchase, review | `/store/*` (read-only) |
| **Seller** | Can manage own products, view commissions | `/store/sellers/me`, `/store/commissions` |
| **Admin** | Full platform access | `/admin/*` |

**Middleware Usage**:
```typescript
// Require authentication
app.use('/store/commissions', authenticate)

// Require specific role
app.use('/admin/*', authenticate, authorize(['admin']))

// Allow multiple roles
app.use('/store/sellers', authenticate, authorize(['seller', 'admin']))
```

### 3. User Registration & Login

**Endpoints to Add**:
```
POST /auth/register        - Register new user (buyer/seller)
POST /auth/login           - Login with email/password
POST /auth/logout          - Logout and revoke token
POST /auth/refresh         - Refresh access token
POST /auth/verify-email    - Verify email with token
POST /auth/forgot-password - Request password reset
POST /auth/reset-password  - Reset password with token
GET  /auth/me              - Get current user info
```

### 4. Session Management

**Features**:
- Store active sessions in Redis
- Track login history
- Support multiple devices
- Session timeout after inactivity
- Force logout on password change

### 5. Email Verification

**Flow**:
```
User registers → Email sent with verification link
→ User clicks link → Token validated → Email verified
→ Account activated
```

**Implementation**:
- Generate verification token (UUID)
- Store token with expiration (24 hours)
- Send email via configured email service
- Verify token and activate account

### 6. Password Reset

**Flow**:
```
User forgot password → Enter email → Reset link sent
→ User clicks link → Enter new password → Password updated
→ All sessions invalidated
```

---

## Technical Implementation

### JWT Token Structure

**Access Token** (15 min expiry):
```json
{
  "user_id": "usr_123",
  "email": "user@example.com",
  "role": "seller",
  "seller_id": "seller_456",  // if role=seller
  "iat": 1701234567,
  "exp": 1701235467
}
```

**Refresh Token** (7 days expiry):
```json
{
  "user_id": "usr_123",
  "token_id": "tok_789",
  "iat": 1701234567,
  "exp": 1701838967
}
```

### Password Hashing

```typescript
// Using bcrypt with 12 rounds
import bcrypt from 'bcrypt'

// Hash password
const hashedPassword = await bcrypt.hash(password, 12)

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword)
```

### Middleware Chain

```typescript
// Public route - no auth needed
GET /store/sellers

// Protected route - auth required
GET /store/commissions
  → authenticate (verify JWT)
  → route handler

// Admin-only route
POST /admin/sellers/:id/verify
  → authenticate (verify JWT)
  → authorize(['admin']) (check role)
  → route handler

// Seller or Admin route
GET /store/sellers/:id
  → authenticate
  → authorize(['seller', 'admin'])
  → checkOwnership (seller can only view own profile)
  → route handler
```

---

## Integration with Existing Code

**No Breaking Changes!**

Phase 2 API routes will be updated by simply adding middleware:

**Before** (Phase 2):
```typescript
// backend/src/api/routes/store/commissions/route.ts
export async function GET(req: Request) {
  // Get commissions
}
```

**After** (Phase 2.5):
```typescript
// backend/src/api/routes/store/commissions/route.ts
import { authenticate, authorize } from '@/middleware/auth'

// Middleware applied via Medusa API route config
export const config = {
  middleware: [authenticate, authorize(['seller', 'admin'])]
}

export async function GET(req: Request) {
  const { user } = req  // user added by authenticate middleware
  // Get commissions for user.seller_id
}
```

---

## Database Changes

### New Tables

**1. User Sessions** (Redis):
```typescript
{
  session_id: string       // UUID
  user_id: string         // User reference
  refresh_token: string   // Hashed token
  device_info: object     // Browser, IP
  created_at: timestamp
  expires_at: timestamp
}
```

**2. Email Verification Tokens** (PostgreSQL):
```typescript
{
  id: string              // UUID
  user_id: string        // User reference
  token: string          // Verification token
  expires_at: timestamp
  used_at: timestamp | null
}
```

**3. Password Reset Tokens** (PostgreSQL):
```typescript
{
  id: string
  user_id: string
  token: string
  expires_at: timestamp
  used_at: timestamp | null
}
```

### Extend Existing Tables

**Users Table** (extends Medusa customer):
```typescript
{
  // Existing fields...
  role: enum['buyer', 'seller', 'admin']
  email_verified: boolean
  email_verified_at: timestamp | null
  password_changed_at: timestamp
  last_login_at: timestamp
}
```

---

## Security Considerations

### 1. Password Requirements
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### 2. Rate Limiting
- Login: 5 attempts per 15 minutes
- Registration: 3 attempts per hour
- Password reset: 3 requests per hour
- Email verification: 5 requests per hour

### 3. Token Security
- Access tokens: Short-lived (15 min)
- Refresh tokens: Stored hashed in database
- Token rotation on refresh
- Blacklist for revoked tokens (Redis)

### 4. CORS Configuration
```typescript
{
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## Testing Strategy

### Unit Tests
- JWT generation/validation
- Password hashing/verification
- Token expiration logic
- Role validation

### Integration Tests
- Login flow end-to-end
- Token refresh flow
- Email verification flow
- Password reset flow
- Authorization checks

### Security Tests
- SQL injection attempts
- XSS attempts
- CSRF protection
- Rate limiting verification
- Token tampering detection

---

## Implementation Checklist

### JWT & Password (Week 1)
- [ ] Install dependencies (`jsonwebtoken`, `bcrypt`)
- [ ] Create JWT utilities (generate, verify, decode)
- [ ] Create password utilities (hash, compare)
- [ ] Write unit tests for utilities

### Middleware (Week 1)
- [ ] Create `authenticate` middleware
- [ ] Create `authorize` middleware
- [ ] Create `checkOwnership` middleware
- [ ] Test middleware with mock requests

### Auth Endpoints (Week 2)
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] POST /auth/logout
- [ ] POST /auth/refresh
- [ ] GET /auth/me
- [ ] Add validation for all endpoints

### Email Verification (Week 2)
- [ ] Create email verification model
- [ ] POST /auth/verify-email
- [ ] POST /auth/resend-verification
- [ ] Configure email service (SendGrid/Mailgun)
- [ ] Create email templates

### Password Reset (Week 3)
- [ ] Create password reset model
- [ ] POST /auth/forgot-password
- [ ] POST /auth/reset-password
- [ ] Email templates for reset

### Session Management (Week 3)
- [ ] Redis session storage
- [ ] Session cleanup job (remove expired)
- [ ] Multi-device support
- [ ] Force logout on password change

### Integration (Week 4)
- [ ] Add middleware to Phase 2 API routes
- [ ] Update all `/store/*` routes with auth
- [ ] Update all `/admin/*` routes with auth+role
- [ ] Test all endpoints with authentication

### Documentation (Week 4)
- [ ] API authentication docs
- [ ] Frontend integration guide
- [ ] Security best practices
- [ ] Token refresh examples

---

## Success Metrics

✅ All API routes protected with authentication
✅ Role-based access working correctly
✅ Token refresh mechanism functioning
✅ Email verification flow complete
✅ Password reset flow complete
✅ Unit tests passing (>80% coverage)
✅ Integration tests passing
✅ Security tests passing
✅ Documentation complete

---

## Dependencies

**NPM Packages**:
```json
{
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/bcrypt": "^5.0.2"
}
```

**Environment Variables**:
```env
# JWT Configuration
JWT_SECRET=<random-256-bit-secret>
JWT_REFRESH_SECRET=<different-random-secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email Service (SendGrid example)
SENDGRID_API_KEY=<your-key>
FROM_EMAIL=noreply@martnex.io

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

---

## Phase 2.5 Complete When...

1. ✅ All 8 auth endpoints implemented and tested
2. ✅ Middleware applied to all Phase 2 API routes
3. ✅ JWT generation/validation working
4. ✅ Role-based authorization enforced
5. ✅ Email verification flow complete
6. ✅ Password reset flow complete
7. ✅ Session management in Redis
8. ✅ Documentation updated
9. ✅ Tests passing (unit + integration)
10. ✅ Security audit passed

---

## Next: Phase 3

After Phase 2.5 authentication is complete, Phase 3 will focus on:
- **Product-Seller Relationships** - Map products to sellers
- **Order Workflows** - Auto-create commissions
- **Payment Processing** - Stripe/PayPal payout integration
- **Frontend Dashboards** - Seller, Admin, Buyer UIs

---

**Status**: Ready to begin Phase 2.5 implementation
**Estimated Duration**: 3-4 weeks
**Complexity**: Medium (standard authentication patterns)
**Risk Level**: Low (well-established patterns, no breaking changes)
