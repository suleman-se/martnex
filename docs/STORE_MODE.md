# Store Mode Configuration

## Overview

Martnex supports two operational modes controlled by a single environment variable. This allows you to run either a simple e-commerce store or a full multi-vendor marketplace with the same codebase.

## The Two Modes

### 🏪 Single Store Mode

**Perfect for:**
- Individual businesses
- Single brand stores
- Dropshipping operations
- Small businesses selling their own products

**What you get:**
- ✅ Full e-commerce functionality (products, cart, checkout, orders)
- ✅ Admin dashboard to manage everything
- ✅ Customer accounts and order history
- ✅ Payment processing (Stripe, PayPal)
- ✅ Optional features (reviews, wishlist, loyalty points)

**What's disabled:**
- ❌ Seller registration
- ❌ Commission calculations
- ❌ Payout system
- ❌ Seller dashboards
- ❌ Multi-vendor complexity

**Database impact:**
- Smaller database (no seller, commission, or payout tables)
- Faster queries
- Simpler data model

---

### 🏢 Multi-Vendor Marketplace Mode

**Perfect for:**
- Etsy-like marketplaces
- Amazon-style platforms
- Niche marketplaces
- Community-driven stores

**What you get:**
- ✅ Everything from Single Store Mode, PLUS:
- ✅ Seller registration and verification
- ✅ Seller dashboards
- ✅ Automatic commission calculations
- ✅ Payout management system
- ✅ Seller analytics and reporting
- ✅ Dispute resolution (recommended)

**Additional features:**
- Multiple sellers can register
- Each product belongs to a seller
- Automatic commission tracking
- Sellers can request payouts
- Admin approves sellers and payouts

**Database impact:**
- Additional tables for sellers, commissions, payouts
- More complex queries
- Full marketplace data model

---

## Configuration

### Quick Start

**Option 1: Single Store** (Simple E-commerce)
```bash
# backend/.env
STORE_MODE=SINGLE_STORE

# That's it! Everything else is automatic.
```

**Option 2: Multi-Vendor Marketplace** (Full Platform)
```bash
# backend/.env
STORE_MODE=MULTI_VENDOR_MARKETPLACE

# Optional: Configure marketplace settings
DEFAULT_COMMISSION_RATE=10
MINIMUM_PAYOUT_AMOUNT=50
REQUIRE_SELLER_VERIFICATION=true
```

### Complete Example Configurations

#### Example 1: Simple Online Store

```env
# Store Mode
STORE_MODE=SINGLE_STORE

# Required
DATABASE_URL=postgres://user:pass@localhost:5432/mystore
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
COOKIE_SECRET=your-cookie-secret

# Payment (at least one)
ENABLE_STRIPE=true
STRIPE_API_KEY=sk_test_...

# Storage
ENABLE_LOCAL_STORAGE=true

# Optional Features
ENABLE_REVIEWS=true
ENABLE_WISHLIST=true
ENABLE_EMAIL=true
```

#### Example 2: Full Marketplace

```env
# Store Mode
STORE_MODE=MULTI_VENDOR_MARKETPLACE

# Required
DATABASE_URL=postgres://user:pass@localhost:5432/marketplace
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
COOKIE_SECRET=your-cookie-secret

# Payment (at least one)
ENABLE_STRIPE=true
ENABLE_PAYPAL=true
STRIPE_API_KEY=sk_test_...
PAYPAL_CLIENT_ID=...

# Storage
ENABLE_S3=true
S3_BUCKET=my-marketplace-assets
S3_REGION=us-east-1

# Optional Features
ENABLE_REVIEWS=true
ENABLE_DISPUTES=true
ENABLE_WISHLIST=true
ENABLE_LOYALTY=false
ENABLE_EMAIL=true

# Marketplace Settings
DEFAULT_COMMISSION_RATE=10
MAX_COMMISSION_RATE=50
MINIMUM_PAYOUT_AMOUNT=50
PAYOUT_ESCROW_DAYS=7
REQUIRE_SELLER_VERIFICATION=true
```

---

## How It Works

### Automatic Feature Detection

When you set `STORE_MODE`, the system automatically:

1. **Loads appropriate modules** - Only registers modules needed for your mode
2. **Runs correct migrations** - Creates only the database tables you need
3. **Configures APIs** - Exposes only relevant endpoints
4. **Adjusts admin UI** - Shows/hides features based on mode

### Behind the Scenes

```typescript
// backend/src/config/store-mode.ts
export const FEATURES = {
  // Always available
  PRODUCTS: true,
  CART: true,
  ORDERS: true,

  // Mode-dependent
  SELLER_MODULE: isMultiVendorMode(),
  COMMISSION_MODULE: isMultiVendorMode(),
  PAYOUT_MODULE: isMultiVendorMode(),

  // Optional (user choice)
  REVIEWS: process.env.ENABLE_REVIEWS === 'true',
  WISHLIST: process.env.ENABLE_WISHLIST === 'true',
}
```

### Database Migrations

Migrations run conditionally based on enabled modules:

```bash
# Single Store Mode
npm run db:migrate
# Creates: products, customers, orders, carts
# Skips: seller, commission, payout tables

# Multi-Vendor Mode
npm run db:migrate
# Creates: ALL tables including seller, commission, payout
```

---

## Switching Modes

### Can I switch later?

**Yes!** You can switch modes by:

1. Changing `STORE_MODE` in `.env`
2. Running migrations: `npm run db:migrate`
3. Restarting the server

**Single → Multi-Vendor:**
- ✅ Safe upgrade path
- New tables will be created
- Existing data preserved
- You become the first seller (optional migration script)

**Multi-Vendor → Single:**
- ⚠️ More complex
- Seller/commission data preserved but not used
- You'll need to manage all products as admin
- Consider data migration

---

## Feature Comparison

| Feature | Single Store | Multi-Vendor |
|---------|-------------|--------------|
| **Products** | ✅ You manage | ✅ Sellers manage |
| **Orders** | ✅ You fulfill | ✅ Sellers fulfill |
| **Payments** | ✅ You receive | ✅ Split commissions |
| **Dashboard** | ✅ Admin only | ✅ Admin + Sellers |
| **Registration** | ❌ No sellers | ✅ Seller signup |
| **Commissions** | ❌ N/A | ✅ Automatic |
| **Payouts** | ❌ N/A | ✅ Managed |
| **Complexity** | 🟢 Simple | 🟡 Moderate |
| **Database Size** | 🟢 Small | 🟡 Larger |
| **Performance** | 🟢 Faster | 🟢 Good |

---

## Validation

The system automatically validates your configuration on startup:

```
❌ Configuration validation failed:

  • At least one payment provider must be enabled
  • At least one storage provider must be enabled
  • Multi-vendor mode requires commission module
```

If validation fails, the server won't start until issues are fixed.

---

## Advanced Configuration

### Marketplace-Specific Settings

These settings only apply when `STORE_MODE=MULTI_VENDOR_MARKETPLACE`:

```env
# Seller Verification
REQUIRE_SELLER_VERIFICATION=true   # Admin must approve sellers
# Default: true

# Commission Rates
DEFAULT_COMMISSION_RATE=10          # 10% platform commission
MAX_COMMISSION_RATE=50              # Maximum allowed rate
# You can set custom rates per seller or category via admin

# Payouts
MINIMUM_PAYOUT_AMOUNT=50            # Minimum $50 to request payout
PAYOUT_ESCROW_DAYS=7                # Hold funds for 7 days after delivery
# This protects against fraud and chargebacks
```

### Optional Features (Both Modes)

```env
# Customer Features
ENABLE_REVIEWS=true                 # Product reviews & ratings
ENABLE_WISHLIST=true                # Save products for later
ENABLE_LOYALTY=false                # Points/rewards system

# Business Features
ENABLE_ANALYTICS=true               # Advanced reporting
ENABLE_DISPUTES=true                # Dispute resolution system

# Integrations
ENABLE_EMAIL=true                   # Email notifications
ENABLE_SMS=false                    # SMS notifications (Twilio)
ENABLE_PUSH=false                   # Push notifications
```

---

## FAQ

### Q: Which mode should I choose?

**Choose Single Store if:**
- You're selling your own products
- You don't need other sellers
- You want simplicity

**Choose Multi-Vendor if:**
- You want to build a marketplace
- You'll have multiple sellers
- You need commission tracking

### Q: Can I run both modes simultaneously?

No, but you can run multiple instances:
- Instance A: Single Store (port 9001)
- Instance B: Multi-Vendor (port 9002)

### Q: Does mode affect frontend?

Yes! The frontend automatically adapts:
- Single Store: No seller registration UI
- Multi-Vendor: Full seller dashboard, registration flows

### Q: What about performance?

**Single Store:**
- Fewer database queries
- Smaller bundle size
- Faster page loads

**Multi-Vendor:**
- Slightly more queries (seller relationships)
- Still performant with proper indexing
- Optimized for scale

### Q: Can I hide multi-vendor features temporarily?

Yes! Even in Multi-Vendor mode, you can disable specific features:

```env
STORE_MODE=MULTI_VENDOR_MARKETPLACE
ENABLE_COMMISSION=false  # Disable commissions temporarily
ENABLE_PAYOUT=false      # Disable payouts
```

---

## Next Steps

1. Choose your mode based on business needs
2. Configure `.env` file
3. Run migrations: `npm run db:migrate`
4. Start server: `npm run dev`
5. Check startup logs to confirm configuration

Example startup log:

```
┌─────────────────────────────────────────────┐
│  🏪 Martnex Configuration                   │
├─────────────────────────────────────────────┤
│  Mode: SINGLE_STORE                         │
│  Custom Modules: 0                          │
│  Enabled Features: 12                       │
└─────────────────────────────────────────────┘

🏪 Single Store Mode

Custom Modules to Load:
  (none - using Medusa core modules only)

Enabled Features:
  ✓ PRODUCTS
  ✓ CART
  ✓ ORDERS
  ✓ STRIPE
  ✓ LOCAL_STORAGE
  ✓ REVIEWS
  ...
```

---

## Troubleshooting

### Server won't start

Check for configuration errors:
```bash
# View detailed error
npm run dev

# Common issues:
# - Missing required env vars
# - Invalid STORE_MODE value
# - No payment provider enabled
# - No storage provider enabled
```

### Wrong mode detected

Verify `.env` file:
```bash
# Check current value
grep STORE_MODE backend/.env

# Should be one of:
# STORE_MODE=SINGLE_STORE
# STORE_MODE=MULTI_VENDOR_MARKETPLACE
```

### Database issues after mode switch

Run migrations:
```bash
npm run db:migrate
```

---

## Support

- 📖 Full documentation: `/docs`
- 🐛 Report issues: GitHub Issues
- 💬 Get help: GitHub Discussions
