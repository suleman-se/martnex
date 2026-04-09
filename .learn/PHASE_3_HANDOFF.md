# Phase 3 Handoff - Pending Tasks from Phase 2.5

**Created:** December 8, 2025
**Phase 2.5 Status:** ✅ Complete
**Phase 3 Status:** ✅ Complete (See `3_DATABASE_INTEGRATION_SUMMARY.md`)

---

## Overview

Phase 2.5 successfully implemented the **authentication foundation** (JWT, middleware, endpoints) with 97 passing tests. However, several features were intentionally deferred because they require database integration. This document lists all pending items that must be completed in Phase 3.

---

## 🔴 Critical: Database Integration Required

### 1. User Model Creation

**Status:** Not started (deferred from Phase 2.5)

**What's Needed:**
Create a Medusa DML (Data Model Layer) for users with authentication fields.

**File to Create:**
- `backend/src/modules/user/models/user.ts`

**Schema:**
```typescript
import { model } from "@medusajs/framework/utils"

const User = model.define("user", {
  id: model.id().primaryKey(),
  email: model.text().unique(),
  password_hash: model.text(),
  first_name: model.text(),
  last_name: model.text().nullable(),

  // Authentication fields
  role: model.enum(['buyer', 'seller', 'admin']).default('buyer'),
  email_verified: model.boolean().default(false),
  email_verified_at: model.dateTime().nullable(),

  // Seller relationship
  seller_id: model.text().nullable(), // Links to Seller module

  // Security fields
  password_changed_at: model.dateTime(),
  last_login_at: model.dateTime().nullable(),

  // Timestamps
  created_at: model.dateTime(),
  updated_at: model.dateTime(),
})

export default User
```

**Service to Create:**
- `backend/src/modules/user/service.ts` - User CRUD operations

**Tests to Add:**
- User model validation
- User service CRUD operations
- Email uniqueness constraints

---

### 2. Email Verification Tokens

**Status:** Endpoint created, database integration pending

**Files with TODOs:**
- `backend/src/api/auth/register/route.ts` (line 28-29)
- `backend/src/api/auth/verify-email/route.ts` (line 21-28)

**What's Needed:**
```typescript
// Model to create
const EmailVerification = model.define("email_verification", {
  id: model.id().primaryKey(),
  user_id: model.text().references("user.id"),
  token: model.text().unique(),
  expires_at: model.dateTime(),
  used_at: model.dateTime().nullable(),
  created_at: model.dateTime(),
})
```

**Implementation Tasks:**
1. Create EmailVerification model
2. Update `POST /auth/register` to save verification token
3. Update `POST /auth/verify-email` to:
   - Query token from database
   - Check expiration (24 hours)
   - Mark user as verified
   - Delete used token
4. Add email sending integration (see section below)

**Current Code Location:**
- Registration: [backend/src/api/auth/register/route.ts:28](backend/src/api/auth/register/route.ts#L28)
- Verification: [backend/src/api/auth/verify-email/route.ts:21](backend/src/api/auth/verify-email/route.ts#L21)

---

### 3. Password Reset Tokens

**Status:** Endpoints created, database integration pending

**Files with TODOs:**
- `backend/src/api/auth/forgot-password/route.ts` (line 25-31)
- `backend/src/api/auth/reset-password/route.ts` (line 40-48)

**What's Needed:**
```typescript
// Model to create
const PasswordReset = model.define("password_reset", {
  id: model.id().primaryKey(),
  user_id: model.text().references("user.id"),
  token: model.text().unique(),
  expires_at: model.dateTime(),
  used_at: model.dateTime().nullable(),
  created_at: model.dateTime(),
})
```

**Implementation Tasks:**
1. Create PasswordReset model
2. Update `POST /auth/forgot-password` to:
   - Check if user exists
   - Generate and save token (15-minute expiry)
   - Send password reset email
3. Update `POST /auth/reset-password` to:
   - Verify token exists and not expired
   - Update user password
   - Delete used token
   - Invalidate all refresh tokens

**Current Code Location:**
- Forgot password: [backend/src/api/auth/forgot-password/route.ts:25](backend/src/api/auth/forgot-password/route.ts#L25)
- Reset password: [backend/src/api/auth/reset-password/route.ts:40](backend/src/api/auth/reset-password/route.ts#L40)

---

### 4. Login Implementation

**Status:** Endpoint created with mock data, needs real database queries

**Files with TODOs:**
- `backend/src/api/auth/login/route.ts` (line 27-30)

**Current Issue:**
Using mock user data:
```typescript
const mockUser = {
  user_id: 'user_123',
  email: email,
  password_hash: '$2b$12$abcdefghijklmnopqrstuv.hashedpassword',
  role: 'buyer' as const,
  email_verified: true
}
```

**What's Needed:**
```typescript
// Replace mock with real database query
const userService = container.resolve('userService')
const user = await userService.findByEmail(email)

if (!user) {
  res.status(401).json({
    message: 'Invalid credentials',
    error: 'Email or password is incorrect'
  })
  return
}

// Verify password against real hash
const isValidPassword = await verifyPassword(password, user.password_hash)
```

**Current Code Location:**
- [backend/src/api/auth/login/route.ts:27](backend/src/api/auth/login/route.ts#L27)

---

### 5. Registration Implementation

**Status:** Endpoint created, needs database save

**Files with TODOs:**
- `backend/src/api/auth/register/route.ts` (line 22-23, 28-29)

**What's Needed:**
```typescript
// Check if user already exists
const userService = container.resolve('userService')
const existingUser = await userService.findByEmail(validatedData.email)

if (existingUser) {
  res.status(409).json({
    message: 'Registration failed',
    error: 'An account with this email already exists'
  })
  return
}

// Create user
const user = await userService.create({
  email: validatedData.email,
  password_hash: hashedPassword,
  first_name: validatedData.first_name,
  last_name: validatedData.last_name,
  role: validatedData.role,
  email_verified: false,
  password_changed_at: new Date()
})

// Save verification token
const verificationService = container.resolve('emailVerificationService')
await verificationService.create({
  user_id: user.id,
  token: verificationToken,
  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
})
```

**Current Code Location:**
- [backend/src/api/auth/register/route.ts:22](backend/src/api/auth/register/route.ts#L22)

---

## 🟡 Important: Redis Integration

### 6. Refresh Token Storage

**Status:** Tokens generated but not stored

**Files with TODOs:**
- `backend/src/api/auth/login/route.ts` (line 60)
- `backend/src/api/auth/refresh/route.ts` (line 26-27)
- `backend/src/api/auth/logout/route.ts` (line 20-22)

**What's Needed:**

**Redis Schema:**
```
Key: refresh_token:{user_id}:{token_id}
Value: {
  user_id: string
  token_hash: string  // bcrypt hash of refresh token
  device_info: object
  created_at: timestamp
  expires_at: timestamp
}
TTL: 7 days (auto-expire)
```

**Implementation Tasks:**

1. **On Login** (store refresh token):
```typescript
// Generate token_id
const tokenId = crypto.randomUUID()

// Generate refresh token
const refreshToken = generateRefreshToken({
  user_id: user.id,
  token_id: tokenId
})

// Store in Redis
const redis = container.resolve('redis')
const tokenHash = await hashPassword(refreshToken)
await redis.setex(
  `refresh_token:${user.id}:${tokenId}`,
  7 * 24 * 60 * 60, // 7 days
  JSON.stringify({
    user_id: user.id,
    token_hash: tokenHash,
    device_info: {
      user_agent: req.headers['user-agent'],
      ip: req.ip
    },
    created_at: new Date(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
)
```

2. **On Refresh** (verify and rotate):
```typescript
// Decode refresh token to get token_id
const decoded = verifyRefreshToken(refresh_token)

// Fetch from Redis
const redis = container.resolve('redis')
const stored = await redis.get(`refresh_token:${decoded.user_id}:${decoded.token_id}`)

if (!stored) {
  res.status(401).json({ message: 'Invalid refresh token' })
  return
}

// Verify token hash
const storedData = JSON.parse(stored)
const isValid = await verifyPassword(refresh_token, storedData.token_hash)

if (!isValid) {
  res.status(401).json({ message: 'Invalid refresh token' })
  return
}

// Generate new access token
const newAccessToken = generateAccessToken({
  user_id: decoded.user_id,
  email: user.email,
  role: user.role,
  seller_id: user.seller_id
})

// Optional: Rotate refresh token (create new, delete old)
```

3. **On Logout** (invalidate token):
```typescript
const decoded = verifyAccessToken(token)
const redis = container.resolve('redis')

// Delete refresh token
await redis.del(`refresh_token:${decoded.user_id}:*`)

// Optional: Add access token to blacklist
await redis.setex(
  `token_blacklist:${token}`,
  15 * 60, // 15 minutes (access token TTL)
  '1'
)
```

**Current Code Locations:**
- Login: [backend/src/api/auth/login/route.ts:60](backend/src/api/auth/login/route.ts#L60)
- Refresh: [backend/src/api/auth/refresh/route.ts:26](backend/src/api/auth/refresh/route.ts#L26)
- Logout: [backend/src/api/auth/logout/route.ts:20](backend/src/api/auth/logout/route.ts#L20)

---

### 7. Token Blacklist (Optional)

**Status:** Not implemented

**Purpose:**
Immediately revoke access tokens on logout (otherwise valid until expiry).

**Redis Schema:**
```
Key: token_blacklist:{access_token}
Value: 1
TTL: 15 minutes (access token TTL)
```

**Implementation:**
Add check in `authenticate` middleware:
```typescript
// In backend/src/middleware/authenticate.ts
const redis = container.resolve('redis')
const isBlacklisted = await redis.exists(`token_blacklist:${token}`)

if (isBlacklisted) {
  res.status(401).json({
    message: 'Token has been revoked'
  })
  return
}
```

---

## 🟢 Nice-to-Have: Email Integration

### 8. Email Verification Email

**Status:** Token generated, email not sent

**Files with TODOs:**
- `backend/src/api/auth/register/route.ts` (line 31)

**What's Needed:**

1. **Install email service** (SendGrid, AWS SES, or Resend):
```bash
pnpm add @sendgrid/mail
# or
pnpm add @aws-sdk/client-ses
# or
pnpm add resend
```

2. **Create email service:**
```typescript
// backend/src/services/email-service.ts
export class EmailService {
  async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

    await sendEmail({
      to: email,
      subject: 'Verify your email - Martnex',
      html: `
        <h1>Welcome to Martnex!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `
    })
  }
}
```

3. **Update registration endpoint:**
```typescript
// In register/route.ts
const emailService = container.resolve('emailService')
await emailService.sendVerificationEmail(
  validatedData.email,
  verificationToken
)
```

**Current Code Location:**
- [backend/src/api/auth/register/route.ts:31](backend/src/api/auth/register/route.ts#L31)

---

### 9. Password Reset Email

**Status:** Token generated, email not sent

**Files with TODOs:**
- `backend/src/api/auth/forgot-password/route.ts` (line 31)

**What's Needed:**

```typescript
// In EmailService
async sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  await sendEmail({
    to: email,
    subject: 'Reset your password - Martnex',
    html: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  })
}
```

**Current Code Location:**
- [backend/src/api/auth/forgot-password/route.ts:31](backend/src/api/auth/forgot-password/route.ts#L31)

---

## 🟢 Enhancement: Security Features

### 10. Rate Limiting

**Status:** Not implemented (deferred)

**What's Needed:**

Install rate limiter:
```bash
pnpm add express-rate-limit
```

Add to auth endpoints:
```typescript
import rateLimit from 'express-rate-limit'

// Login rate limit: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later'
})

// Registration rate limit: 3 per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many registration attempts'
})

// Apply to routes
router.post('/auth/login', loginLimiter, handler)
router.post('/auth/register', registerLimiter, handler)
```

---

### 11. Audit Logging for Auth Events

**Status:** Not implemented

**What's Needed:**

Integrate with existing audit logging system from Phase 2:

```typescript
// Log auth events
import { AuditService } from '../services/audit-service'

// In login handler
await auditService.log({
  action: 'user.login',
  actor_id: user.id,
  actor_type: 'user',
  metadata: {
    ip: req.ip,
    user_agent: req.headers['user-agent']
  }
})

// In logout handler
await auditService.log({
  action: 'user.logout',
  actor_id: user.id,
  actor_type: 'user'
})

// In failed login
await auditService.log({
  action: 'user.login_failed',
  metadata: {
    email: email,
    ip: req.ip,
    reason: 'invalid_credentials'
  }
})
```

---

## 📋 Implementation Priority

### Phase 3.1 - Database (Week 1)
**Priority: Critical**
1. ✅ Create User model
2. ✅ Create User service
3. ✅ Update login endpoint with real queries
4. ✅ Update registration endpoint with real saves
5. ✅ Create EmailVerification model
6. ✅ Create PasswordReset model

### Phase 3.2 - Redis (Week 2)
**Priority: Important**
7. ✅ Implement refresh token storage
8. ✅ Update refresh endpoint to verify from Redis
9. ✅ Update logout to invalidate tokens
10. ⚪ (Optional) Token blacklist

### Phase 3.3 - Email (Week 3)
**Priority: Nice-to-Have**
11. ✅ Set up email service (SendGrid/SES/Resend)
12. ✅ Send verification emails
13. ✅ Send password reset emails
14. ✅ Update verification endpoint to mark user verified

### Phase 3.4 - Security (Week 4)
**Priority: Enhancement**
15. ⚪ Rate limiting
16. ⚪ Audit logging for auth events
17. ⚪ IP-based restrictions (if needed)

---

## 🔍 Finding TODOs

To find all pending TODOs in the codebase:

```bash
# Search all auth-related files
grep -r "TODO" backend/src/auth backend/src/middleware backend/src/api/auth --include="*.ts"

# Count TODOs
grep -r "TODO" backend/src/auth backend/src/middleware backend/src/api/auth --include="*.ts" | wc -l
```

**Current TODO Count:** 20+ items

---

## ✅ Completion Checklist

Use this checklist to track Phase 3 progress:

### User Model & Service
- [ ] User model created (`backend/src/modules/user/models/user.ts`)
- [ ] User service created (`backend/src/modules/user/service.ts`)
- [ ] User tests written (15+ tests)
- [ ] User module registered in Medusa

### Database Models
- [ ] EmailVerification model created
- [ ] PasswordReset model created
- [ ] Models tested with mock data

### Auth Endpoint Updates
- [ ] `POST /auth/register` - Save to database
- [ ] `POST /auth/login` - Query from database
- [ ] `POST /auth/verify-email` - Update user in database
- [ ] `POST /auth/forgot-password` - Save reset token
- [ ] `POST /auth/reset-password` - Update password in database

### Redis Integration
- [ ] Refresh token storage on login
- [ ] Refresh token verification on refresh
- [ ] Refresh token deletion on logout
- [ ] Token blacklist (optional)

### Email Integration
- [ ] Email service created
- [ ] Verification emails sent
- [ ] Password reset emails sent
- [ ] Email templates created

### Security Enhancements
- [ ] Rate limiting added
- [ ] Audit logging integrated
- [ ] Security testing completed

### Testing
- [ ] All existing tests still pass (106+)
- [ ] New user model tests pass
- [ ] Integration tests with database pass
- [ ] Auth flow end-to-end tests pass

### Documentation
- [ ] Update Phase 2.5 summary with "COMPLETE" status
- [ ] Create Phase 3 summary
- [ ] Update CHANGELOG.md
- [ ] Update README.md roadmap

---

## 📚 Reference Documents

- **Phase 2.5 Summary:** [.learn/PHASE_2.5_AUTH_SUMMARY.md](.learn/PHASE_2.5_AUTH_SUMMARY.md)
- **Phase 2.5 Plan:** [planning/PHASE_2.5_AUTHENTICATION.md](../planning/PHASE_2.5_AUTHENTICATION.md)
- **JWT Utilities:** [backend/src/auth/jwt.ts](../backend/src/auth/jwt.ts)
- **Password Utilities:** [backend/src/auth/password.ts](../backend/src/auth/password.ts)
- **Auth Endpoints:** [backend/src/api/auth/](../backend/src/api/auth/)

---

## 💡 Notes for Next Developer

1. **Don't Break Existing Tests:** All 106 tests must continue passing
2. **Follow Existing Patterns:** Use the same code style and patterns established in Phase 2.5
3. **TODOs Are Your Friend:** Every TODO comment has context about what's needed
4. **Mock Data is Intentional:** Mock data in auth endpoints is a placeholder - replace with real DB queries
5. **Redis is Optional Early On:** You can defer Redis until after database integration works
6. **Email Can Wait:** Email sending is non-blocking - you can test with console logs first

---

**Last Updated:** December 8, 2025
**Author:** Phase 2.5 Implementation Team
**Status:** Ready for Phase 3 👍
