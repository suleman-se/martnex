# Store Mode Quick Start

## 🎯 Choose Your Mode in 30 Seconds

### Single Store Mode (Simple E-commerce)

```bash
# backend/.env
STORE_MODE=SINGLE_STORE

# Required settings
DATABASE_URL=postgres://user:pass@localhost:5432/mystore
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
COOKIE_SECRET=your-cookie-secret

# Payment (at least one)
ENABLE_STRIPE=true
STRIPE_API_KEY=sk_test_...

# Storage
ENABLE_LOCAL_STORAGE=true

# Optional
ENABLE_REVIEWS=true
ENABLE_WISHLIST=true
ENABLE_EMAIL=true
```

**That's it!** Run `pnpm run db:migrate && pnpm run dev`

---

### Multi-Vendor Marketplace Mode (Full Platform)

```bash
# backend/.env
STORE_MODE=MULTI_VENDOR_MARKETPLACE

# Required settings
DATABASE_URL=postgres://user:pass@localhost:5432/marketplace
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
COOKIE_SECRET=your-cookie-secret

# Payment (at least one)
ENABLE_STRIPE=true
STRIPE_API_KEY=sk_test_...

# Storage
ENABLE_LOCAL_STORAGE=true

# Marketplace Settings
DEFAULT_COMMISSION_RATE=10
MINIMUM_PAYOUT_AMOUNT=50
REQUIRE_SELLER_VERIFICATION=true

# Optional
ENABLE_REVIEWS=true
ENABLE_DISPUTES=true
ENABLE_WISHLIST=true
ENABLE_EMAIL=true
```

**That's it!** Run `pnpm run db:migrate && pnpm run dev`

---

## 🔄 Switching Modes

Change `STORE_MODE` in `.env`, then:

```bash
pnpm run db:migrate  # Creates/skips tables automatically
pnpm run dev         # Restart server
```

---

## 📊 What Changes Between Modes?

| Feature | Single Store | Multi-Vendor |
|---------|-------------|--------------|
| **Database Tables** | Products, Orders, Customers | + Sellers, Commissions, Payouts |
| **Admin Dashboard** | Product/Order management | + Seller management, Payouts |
| **API Endpoints** | Store APIs only | + Seller registration, Dashboard |
| **Commission System** | N/A | Automatic calculation |
| **Seller Registration** | N/A | Public registration form |

---

## ✅ Validation

If misconfigured, server won't start:

```
❌ Configuration validation failed:
  • At least one payment provider must be enabled
  • Multi-vendor mode requires commission module
```

Fix the issue and restart.

---

## 📖 Full Documentation

See [docs/STORE_MODE.md](docs/STORE_MODE.md) for complete details.

---

## 🆘 Quick Troubleshooting

**Server won't start?**
```bash
# Check your .env file
cat backend/.env | grep STORE_MODE

# Verify database connection
cat backend/.env | grep DATABASE_URL
```

**Wrong mode detected?**
```bash
# Should be one of these:
# STORE_MODE=SINGLE_STORE
# STORE_MODE=MULTI_VENDOR_MARKETPLACE
```

**Need to change modes?**
1. Edit `backend/.env`
2. Change `STORE_MODE` value
3. Run `pnpm run db:migrate`
4. Run `pnpm run dev`
