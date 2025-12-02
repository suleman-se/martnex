# Feature Flags Guide

> **"Give users the banana, not the monkey holding the banana"**

This document explains how to use feature flags to enable/disable features in Martnex.

---

## Quick Start

### 1. Simple E-commerce Store (No Marketplace)

Just want a basic online store? Disable marketplace features:

```env
# backend/.env
ENABLE_MULTI_VENDOR=false
ENABLE_COMMISSION=false
ENABLE_PAYOUT=false
ENABLE_REVIEWS=false
ENABLE_DISPUTES=false

# Just enable what you need
ENABLE_STRIPE=true
ENABLE_EMAIL=true
```

```env
# frontend/.env.local
NEXT_PUBLIC_ENABLE_MULTI_VENDOR=false
NEXT_PUBLIC_ENABLE_STRIPE=true
```

**Result:** Clean, simple store with product catalog, cart, and checkout.

---

### 2. Full Marketplace (All Features)

Want everything? Enable all features:

```env
# backend/.env
ENABLE_MULTI_VENDOR=true
ENABLE_COMMISSION=true
ENABLE_PAYOUT=true
ENABLE_REVIEWS=true
ENABLE_DISPUTES=true
ENABLE_WISHLIST=true
ENABLE_LOYALTY=true
ENABLE_ANALYTICS=true

# Payment options
ENABLE_STRIPE=true
ENABLE_PAYPAL=true

# Notifications
ENABLE_EMAIL=true
ENABLE_SMS=true
```

**Result:** Full-featured multi-vendor marketplace with all bells and whistles.

---

### 3. Niche Store (Pick & Choose)

Want just reviews and wishlist? No problem:

```env
# backend/.env
ENABLE_MULTI_VENDOR=false  # Single vendor
ENABLE_REVIEWS=true        # Customer reviews
ENABLE_WISHLIST=true       # Save for later
ENABLE_STRIPE=true         # Payments
ENABLE_EMAIL=true          # Email notifications
```

**Result:** Single-vendor store with reviews and wishlist functionality.

---

## Available Features

### Core Marketplace Features (Enabled by Default)

These are enabled by default but can be disabled:

| Feature | Flag | Description |
|---------|------|-------------|
| Multi-Vendor | `ENABLE_MULTI_VENDOR` | Multiple sellers can list products |
| Commission | `ENABLE_COMMISSION` | Track platform commission on sales |
| Payout | `ENABLE_PAYOUT` | Seller payout management |

**To disable:** Set to `false` in `.env`

```env
ENABLE_MULTI_VENDOR=false
```

---

### Optional Features (Disabled by Default)

These are disabled by default. Enable as needed:

| Feature | Flag | Description |
|---------|------|-------------|
| Reviews | `ENABLE_REVIEWS` | Product reviews and ratings |
| Disputes | `ENABLE_DISPUTES` | Dispute resolution system |
| Wishlist | `ENABLE_WISHLIST` | Save products for later |
| Loyalty | `ENABLE_LOYALTY` | Points and rewards program |
| Analytics | `ENABLE_ANALYTICS` | Advanced reporting |
| Product Comparison | `ENABLE_PRODUCT_COMPARISON` | Compare products side-by-side |
| Live Chat | `ENABLE_LIVE_CHAT` | Real-time customer support |

**To enable:** Set to `true` in `.env`

```env
ENABLE_REVIEWS=true
ENABLE_WISHLIST=true
```

---

### Payment Providers

Enable one or more payment methods:

| Provider | Flag | Required Credentials |
|----------|------|---------------------|
| Stripe | `ENABLE_STRIPE` | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET` |
| PayPal | `ENABLE_PAYPAL` | `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` |

```env
ENABLE_STRIPE=true
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### Notification Channels

Enable notification methods:

| Channel | Flag | Required Credentials |
|---------|------|---------------------|
| Email | `ENABLE_EMAIL` | `SENDGRID_API_KEY`, `SENDGRID_FROM` |
| SMS | `ENABLE_SMS` | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` |
| Push | `ENABLE_PUSH` | Push service credentials |

```env
ENABLE_EMAIL=true
SENDGRID_API_KEY=SG....
SENDGRID_FROM=noreply@yourstore.com
```

---

### Storage Providers

Choose one file storage provider:

| Provider | Flag | Required Credentials |
|----------|------|---------------------|
| AWS S3 | `ENABLE_S3` | `S3_BUCKET`, `S3_ACCESS_KEY_ID`, etc. |
| Cloudinary | `ENABLE_CLOUDINARY` | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` |

```env
ENABLE_S3=true
S3_BUCKET=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

---

## How It Works

### Backend

Features are checked at runtime using the `FEATURES` object:

```typescript
// backend/features.config.ts
import { FEATURES } from '@/features.config';

if (FEATURES.REVIEWS) {
  // Load review module
  const reviewModule = await import('@/modules/review');
  await reviewModule.initialize();
}
```

### Frontend

Features control what users see:

```tsx
// frontend/src/app/product/[id]/page.tsx
import { FEATURES } from '@/lib/feature-flags';

export default function ProductPage() {
  return (
    <div>
      <ProductDetails />

      {/* Only show if reviews enabled */}
      {FEATURES.REVIEWS && <ReviewSection />}

      {/* Only show if wishlist enabled */}
      {FEATURES.WISHLIST && <AddToWishlistButton />}
    </div>
  );
}
```

---

## Common Configurations

### 1. **Basic Store**
```env
ENABLE_MULTI_VENDOR=false
ENABLE_STRIPE=true
ENABLE_EMAIL=true
```

### 2. **Marketplace (No Reviews)**
```env
ENABLE_MULTI_VENDOR=true
ENABLE_COMMISSION=true
ENABLE_PAYOUT=true
ENABLE_REVIEWS=false  # Don't want reviews
ENABLE_STRIPE=true
```

### 3. **Social Commerce (Reviews + Wishlist)**
```env
ENABLE_MULTI_VENDOR=false
ENABLE_REVIEWS=true
ENABLE_WISHLIST=true
ENABLE_LOYALTY=true
ENABLE_STRIPE=true
```

### 4. **Full Enterprise**
```env
# All features enabled
ENABLE_MULTI_VENDOR=true
ENABLE_COMMISSION=true
ENABLE_PAYOUT=true
ENABLE_REVIEWS=true
ENABLE_DISPUTES=true
ENABLE_WISHLIST=true
ENABLE_LOYALTY=true
ENABLE_ANALYTICS=true
ENABLE_LIVE_CHAT=true

# All payment methods
ENABLE_STRIPE=true
ENABLE_PAYPAL=true

# All notifications
ENABLE_EMAIL=true
ENABLE_SMS=true
```

---

## Checking Enabled Features

### At Startup (Backend)

```bash
npm run dev
```

Output:
```
✓ Enabled features:
  - MULTI_VENDOR
  - COMMISSION
  - PAYOUT
  - REVIEWS
  - STRIPE
  - EMAIL
```

### In Code (Backend)

```typescript
import { isFeatureEnabled, FEATURES } from '@/features.config';

if (isFeatureEnabled('REVIEWS')) {
  // Do something
}

// Or directly
if (FEATURES.REVIEWS) {
  // Do something
}
```

### In Code (Frontend)

```typescript
import { FEATURES, useFeature } from '@/lib/feature-flags';

// In component
function MyComponent() {
  const hasReviews = useFeature('REVIEWS');

  return (
    <div>
      {hasReviews && <ReviewList />}
    </div>
  );
}
```

---

## Benefits

### 1. **Flexibility**
- Start small, add features later
- Different features for different markets
- A/B test features easily

### 2. **Performance**
- Don't load code you don't use
- Smaller bundles
- Faster builds

### 3. **Cost Optimization**
- Only pay for services you use
- No unnecessary database tables
- Reduced infrastructure

### 4. **Easier Development**
- Develop features in isolation
- No breaking changes
- Clear boundaries

### 5. **Better Testing**
- Test each feature independently
- Easy to mock disabled features
- Clear test scope

---

## Migration Example

### Phase 1: Start Simple
```env
# Launch with just core e-commerce
ENABLE_MULTI_VENDOR=false
ENABLE_STRIPE=true
```

### Phase 2: Add Reviews
```env
# After getting customers, enable reviews
ENABLE_REVIEWS=true
```

### Phase 3: Go Marketplace
```env
# Ready to onboard sellers
ENABLE_MULTI_VENDOR=true
ENABLE_COMMISSION=true
ENABLE_PAYOUT=true
```

### Phase 4: Full Platform
```env
# Scale up with all features
ENABLE_DISPUTES=true
ENABLE_ANALYTICS=true
ENABLE_LOYALTY=true
```

---

## Important Notes

### Frontend Must Match Backend

Make sure frontend flags match backend:

```env
# backend/.env
ENABLE_REVIEWS=true

# frontend/.env.local
NEXT_PUBLIC_ENABLE_REVIEWS=true  # Must match!
```

### Restart Required

After changing feature flags, restart services:

```bash
# Docker
docker-compose restart backend
docker-compose restart frontend

# Local
pnpm run dev  # in both backend and frontend
```

### Database Migrations

Some features require database tables:

```bash
# When enabling a new feature that needs tables
pnpm run db:migrate
```

---

## Support

For more details, see:
- [Modular Architecture](./MODULAR_ARCHITECTURE.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)

---

**Remember:** You only pay for (and deploy) what you use. Start simple, scale up when needed! 🍌
