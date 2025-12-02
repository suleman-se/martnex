# Modular Architecture Design

> **Philosophy:** "Give users the banana, not the monkey holding the banana"
>
> Every feature is a self-contained, optional module that can be enabled/disabled independently.

---

## Core Principle: Feature Modules

Each feature in Martnex is designed as an **independent, pluggable module** that:

- ✅ **Can be enabled/disabled** via configuration
- ✅ **Has no hard dependencies** on other features
- ✅ **Is self-contained** with its own models, services, routes
- ✅ **Provides clear interfaces** for optional integration
- ✅ **Fails gracefully** when disabled

---

## Feature Module Structure

```
backend/src/modules/
├── seller/                      # Multi-vendor seller module
│   ├── models/
│   │   └── seller.ts
│   ├── services/
│   │   └── seller-service.ts
│   ├── routes/
│   │   └── seller-routes.ts
│   ├── migrations/
│   │   └── 001_create_seller.ts
│   ├── subscribers/
│   │   └── seller-events.ts
│   ├── config.ts               # Module configuration
│   └── index.ts                # Module entry point
│
├── commission/                  # Commission tracking module
│   ├── models/
│   │   ├── commission.ts
│   │   └── commission-rule.ts
│   ├── services/
│   │   └── commission-service.ts
│   ├── routes/
│   │   └── commission-routes.ts
│   ├── config.ts
│   └── index.ts
│
├── payout/                      # Payout management module
│   ├── models/
│   │   └── payout.ts
│   ├── services/
│   │   └── payout-service.ts
│   ├── routes/
│   │   └── payout-routes.ts
│   ├── config.ts
│   └── index.ts
│
├── review/                      # Product review module
│   ├── models/
│   │   └── review.ts
│   ├── services/
│   │   └── review-service.ts
│   ├── routes/
│   │   └── review-routes.ts
│   ├── config.ts
│   └── index.ts
│
├── dispute/                     # Dispute resolution module
│   ├── models/
│   │   ├── dispute.ts
│   │   └── dispute-message.ts
│   ├── services/
│   │   └── dispute-service.ts
│   ├── routes/
│   │   └── dispute-routes.ts
│   ├── config.ts
│   └── index.ts
│
├── wishlist/                    # Product wishlist module
│   ├── models/
│   │   └── wishlist.ts
│   ├── services/
│   │   └── wishlist-service.ts
│   ├── routes/
│   │   └── wishlist-routes.ts
│   ├── config.ts
│   └── index.ts
│
├── loyalty/                     # Loyalty points module
│   ├── models/
│   │   ├── loyalty-account.ts
│   │   └── loyalty-transaction.ts
│   ├── services/
│   │   └── loyalty-service.ts
│   ├── routes/
│   │   └── loyalty-routes.ts
│   ├── config.ts
│   └── index.ts
│
└── analytics/                   # Analytics module
    ├── models/
    │   └── event.ts
    ├── services/
    │   └── analytics-service.ts
    ├── routes/
    │   └── analytics-routes.ts
    ├── config.ts
    └── index.ts
```

---

## Module Configuration System

### Feature Flags (`backend/features.config.ts`)

```typescript
export const FEATURES = {
  // Core marketplace features
  MULTI_VENDOR: process.env.ENABLE_MULTI_VENDOR !== 'false', // Default: enabled
  COMMISSION: process.env.ENABLE_COMMISSION !== 'false',
  PAYOUT: process.env.ENABLE_PAYOUT !== 'false',

  // Optional features
  REVIEWS: process.env.ENABLE_REVIEWS === 'true',           // Default: disabled
  DISPUTES: process.env.ENABLE_DISPUTES === 'true',
  WISHLIST: process.env.ENABLE_WISHLIST === 'true',
  LOYALTY: process.env.ENABLE_LOYALTY === 'true',
  ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',

  // Payment providers (enable multiple)
  STRIPE: process.env.ENABLE_STRIPE === 'true',
  PAYPAL: process.env.ENABLE_PAYPAL === 'true',

  // Notification channels
  EMAIL: process.env.ENABLE_EMAIL === 'true',
  SMS: process.env.ENABLE_SMS === 'true',
  PUSH: process.env.ENABLE_PUSH === 'true',

  // Storage providers
  S3: process.env.ENABLE_S3 === 'true',
  CLOUDINARY: process.env.ENABLE_CLOUDINARY === 'true',
} as const;

export type FeatureKey = keyof typeof FEATURES;
```

### Module Definition (`module/config.ts`)

```typescript
// Example: backend/src/modules/review/config.ts
import { ModuleConfig } from '@/types/module';

export const reviewModuleConfig: ModuleConfig = {
  name: 'review',
  version: '1.0.0',
  description: 'Product review and rating system',

  // Dependencies (optional integrations)
  optionalDependencies: ['seller', 'analytics'],

  // Routes to register
  routes: {
    prefix: '/api/reviews',
    authenticated: true,
  },

  // Database migrations
  migrations: {
    path: './migrations',
    autoRun: true,
  },

  // Event subscribers
  events: {
    'order.completed': 'onOrderCompleted', // Prompt for review
  },

  // Admin UI components
  adminUI: {
    navigation: {
      label: 'Reviews',
      icon: 'star',
      order: 50,
    },
  },
};
```

---

## Module Loader System

### Dynamic Module Loader (`backend/src/loaders/module-loader.ts`)

```typescript
import { FEATURES } from '@/features.config';
import { ModuleConfig } from '@/types/module';

export class ModuleLoader {
  private enabledModules: Map<string, ModuleConfig> = new Map();

  async loadModules() {
    // Only load enabled modules
    if (FEATURES.REVIEWS) {
      const reviewModule = await import('@/modules/review');
      await this.registerModule(reviewModule.config);
    }

    if (FEATURES.DISPUTES) {
      const disputeModule = await import('@/modules/dispute');
      await this.registerModule(disputeModule.config);
    }

    if (FEATURES.WISHLIST) {
      const wishlistModule = await import('@/modules/wishlist');
      await this.registerModule(wishlistModule.config);
    }

    // ... load other modules based on feature flags
  }

  private async registerModule(config: ModuleConfig) {
    console.log(`✓ Loading module: ${config.name} v${config.version}`);

    // Register routes
    if (config.routes) {
      await this.registerRoutes(config);
    }

    // Register event subscribers
    if (config.events) {
      await this.registerEvents(config);
    }

    // Run migrations
    if (config.migrations?.autoRun) {
      await this.runMigrations(config);
    }

    this.enabledModules.set(config.name, config);
  }

  isModuleEnabled(name: string): boolean {
    return this.enabledModules.has(name);
  }
}
```

---

## Example: Review Module (Fully Self-Contained)

### Module Entry Point (`modules/review/index.ts`)

```typescript
import { ModuleConfig } from '@/types/module';
import { reviewModuleConfig } from './config';
import { ReviewService } from './services/review-service';
import { registerReviewRoutes } from './routes/review-routes';

export const config = reviewModuleConfig;

export async function initialize(container: any) {
  // Register service
  container.register('reviewService', ReviewService);

  // Register routes
  registerReviewRoutes(container);

  console.log('✓ Review module initialized');
}

export { ReviewService };
```

### Service (`modules/review/services/review-service.ts`)

```typescript
import { Review } from '../models/review';

export class ReviewService {
  async createReview(data: CreateReviewDTO) {
    // Check if module is enabled
    if (!FEATURES.REVIEWS) {
      throw new Error('Review feature is not enabled');
    }

    const review = await Review.create(data);

    // Optional integration: Analytics
    if (FEATURES.ANALYTICS) {
      await this.trackReviewEvent(review);
    }

    return review;
  }

  private async trackReviewEvent(review: Review) {
    try {
      const analyticsService = container.resolve('analyticsService');
      await analyticsService.track('review.created', review);
    } catch (error) {
      // Fail gracefully if analytics not available
      console.warn('Analytics not available:', error);
    }
  }
}
```

---

## Frontend Modular Structure

```
frontend/src/
├── features/                    # Feature modules (mirrors backend)
│   ├── seller/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── index.ts
│   ├── reviews/
│   │   ├── components/
│   │   │   ├── ReviewList.tsx
│   │   │   ├── ReviewForm.tsx
│   │   │   └── ReviewStars.tsx
│   │   ├── hooks/
│   │   │   └── useReviews.ts
│   │   ├── api/
│   │   │   └── reviewApi.ts
│   │   └── index.ts
│   ├── wishlist/
│   ├── loyalty/
│   └── disputes/
│
├── lib/
│   └── feature-flags.ts         # Frontend feature flags
```

### Frontend Feature Flags

```typescript
// frontend/src/lib/feature-flags.ts
export const FEATURES = {
  REVIEWS: process.env.NEXT_PUBLIC_ENABLE_REVIEWS === 'true',
  WISHLIST: process.env.NEXT_PUBLIC_ENABLE_WISHLIST === 'true',
  LOYALTY: process.env.NEXT_PUBLIC_ENABLE_LOYALTY === 'true',
  DISPUTES: process.env.NEXT_PUBLIC_ENABLE_DISPUTES === 'true',
} as const;
```

### Conditional Component Rendering

```tsx
// frontend/src/app/products/[id]/page.tsx
import { FEATURES } from '@/lib/feature-flags';
import { ReviewList } from '@/features/reviews';
import { WishlistButton } from '@/features/wishlist';

export default function ProductPage({ params }) {
  return (
    <div>
      <ProductDetails id={params.id} />

      {/* Only show if review module enabled */}
      {FEATURES.REVIEWS && <ReviewList productId={params.id} />}

      {/* Only show if wishlist module enabled */}
      {FEATURES.WISHLIST && <WishlistButton productId={params.id} />}
    </div>
  );
}
```

---

## Module Dependencies

### Optional vs Required

```typescript
// Good: Optional dependency
if (FEATURES.ANALYTICS) {
  await analyticsService.track('event');
}

// Bad: Hard dependency
await analyticsService.track('event'); // Breaks if analytics disabled
```

### Module Communication (Event-Driven)

```typescript
// Modules communicate via events, not direct calls
eventBus.emit('order.completed', { orderId, customerId });

// Review module listens (if enabled)
if (FEATURES.REVIEWS) {
  eventBus.on('order.completed', async (data) => {
    await reviewService.sendReviewRequest(data);
  });
}

// Analytics module listens (if enabled)
if (FEATURES.ANALYTICS) {
  eventBus.on('order.completed', async (data) => {
    await analyticsService.track('order_completed', data);
  });
}
```

---

## Environment Configuration Examples

### Minimal Setup (Just Core E-commerce)

```env
# .env
ENABLE_MULTI_VENDOR=false
ENABLE_COMMISSION=false
ENABLE_PAYOUT=false
ENABLE_REVIEWS=false
ENABLE_DISPUTES=false
ENABLE_WISHLIST=false
ENABLE_LOYALTY=false

# Just basic Stripe payments
ENABLE_STRIPE=true
```

### Full Marketplace Setup

```env
# .env
ENABLE_MULTI_VENDOR=true
ENABLE_COMMISSION=true
ENABLE_PAYOUT=true
ENABLE_REVIEWS=true
ENABLE_DISPUTES=true
ENABLE_WISHLIST=true
ENABLE_LOYALTY=true
ENABLE_ANALYTICS=true

# Multiple payment options
ENABLE_STRIPE=true
ENABLE_PAYPAL=true

# Notifications
ENABLE_EMAIL=true
ENABLE_SMS=true
```

### Niche Use Case (Only Reviews + Wishlist)

```env
# .env
ENABLE_MULTI_VENDOR=false
ENABLE_REVIEWS=true
ENABLE_WISHLIST=true
ENABLE_STRIPE=true
```

---

## Benefits of Modular Architecture

### 1. **Flexible Deployment**
- Small store: Just product catalog + cart + checkout
- Full marketplace: All features enabled
- Custom: Pick and choose features

### 2. **Easier Development**
- Develop features in isolation
- No fear of breaking other features
- Clear boundaries and responsibilities

### 3. **Better Performance**
- Don't load code for disabled features
- Smaller bundle sizes
- Faster builds

### 4. **Easier Testing**
- Test each module independently
- Mock dependencies easily
- Clear test boundaries

### 5. **Cost Optimization**
- Only pay for services you use
- No unnecessary database tables
- Reduced infrastructure requirements

---

## Module Types

### Core Modules (Always Loaded)
- Product Catalog
- Cart Management
- Order Processing
- User Authentication

### Optional Marketplace Modules
- Multi-vendor Sellers
- Commission Tracking
- Payout Management

### Optional Feature Modules
- Reviews & Ratings
- Wishlist
- Loyalty Points
- Disputes
- Analytics

### Integration Modules
- Stripe Payment
- PayPal Payment
- SendGrid Email
- Twilio SMS
- AWS S3 Storage
- Cloudinary Storage

---

## Migration Strategy

### Adding a New Module

1. Create module directory structure
2. Define module config
3. Implement models, services, routes
4. Add feature flag
5. Register in module loader
6. Update documentation

### Removing a Module

1. Set feature flag to `false`
2. Module won't load on next restart
3. Optionally: Remove database tables
4. Optionally: Delete module code

---

## API Response Format (Module-Aware)

```typescript
// Product API response includes enabled features
{
  "id": "prod_123",
  "title": "Awesome Product",
  "price": 29.99,

  // Only included if REVIEWS enabled
  "reviews": FEATURES.REVIEWS ? {
    "average": 4.5,
    "count": 120
  } : undefined,

  // Only included if SELLER enabled
  "seller": FEATURES.MULTI_VENDOR ? {
    "id": "seller_456",
    "name": "Great Store"
  } : undefined,

  // Only included if WISHLIST enabled
  "inWishlist": FEATURES.WISHLIST ? false : undefined
}
```

---

## Documentation

Each module includes:
- `README.md` - What the module does
- `API.md` - API endpoints
- `INTEGRATION.md` - How to integrate with other modules
- `MIGRATION.md` - Database schema changes

---

## Future: Plugin Marketplace

Eventually, modules can be:
- Published as npm packages
- Installed via CLI: `martnex add @martnex/loyalty`
- Community-contributed
- Version-controlled independently

```bash
# Install a community module
pnpm add @martnex/subscription-billing
pnpm martnex enable subscription-billing
```

---

## Summary

**This is true modularity:**
- ✅ Want reviews? Enable them.
- ✅ Don't need loyalty points? Don't enable them.
- ✅ Need just a simple store? Disable marketplace features.
- ✅ Want to build your own features? Use the module pattern.

**Users get the banana, not the monkey! 🍌**
