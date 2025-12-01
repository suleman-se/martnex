# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Next.js Frontend (Vercel)                                   │
│  - React Components                                          │
│  - TailwindCSS + Shadcn/UI                                   │
│  - Client-side State Management                              │
│  - API Client                                                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS/REST API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│  Medusa.js Backend (Railway/DigitalOcean)                    │
│  ├── Core Medusa Services (Products, Cart, Orders)          │
│  ├── Custom Services (Seller, Commission, Disputes)         │
│  ├── API Routes (REST)                                       │
│  ├── Webhooks (Stripe, PayPal)                              │
│  └── Background Jobs                                         │
└────────────────────┬───────────────┬────────────────────────┘
                     │               │
                     ▼               ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│     DATA LAYER           │  │   EXTERNAL SERVICES          │
├──────────────────────────┤  ├──────────────────────────────┤
│ PostgreSQL               │  │ Stripe (Payments)            │
│ - Medusa core tables     │  │ PayPal (Payments)            │
│ - Custom tables          │  │ SendGrid (Email)             │
│                          │  │ Twilio (SMS)                 │
│ Redis                    │  │ AWS S3/Cloudinary (Storage)  │
│ - Session storage        │  │ Sentry (Error Tracking)      │
│ - Cart caching           │  └──────────────────────────────┘
│ - Rate limiting          │
└──────────────────────────┘
```

---

## Frontend Architecture (Next.js)

### Directory Structure

```
src/
├── app/                        # Next.js 16 App Router
│   ├── (auth)/                 # Auth group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (shop)/                 # Shop group (buyers)
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── dashboard/          # Buyer dashboard
│   ├── (seller)/               # Seller group
│   │   └── dashboard/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── earnings/
│   │       └── settings/
│   ├── (admin)/                # Admin group
│   │   └── dashboard/
│   │       ├── users/
│   │       ├── sellers/
│   │       ├── products/
│   │       ├── orders/
│   │       ├── disputes/
│   │       └── reports/
│   └── api/                    # API routes (if needed)
├── components/
│   ├── ui/                     # Shadcn components
│   ├── shared/                 # Shared components
│   ├── buyer/
│   ├── seller/
│   └── admin/
├── lib/
│   ├── api/                    # API client
│   ├── hooks/                  # Custom React hooks
│   ├── utils/                  # Utility functions
│   └── validators/             # Zod schemas
├── store/                      # State management
│   ├── auth/
│   ├── cart/
│   └── notifications/
└── styles/
    └── globals.css
```

### Key Technologies
- **Framework:** Next.js 16 (App Router with Turbopack)
- **Runtime:** React 19+ with Server Components
- **Language:** TypeScript (strict mode)
- **Styling:** TailwindCSS v4 + Shadcn/UI
- **State:** React Context API / Zustand
- **Forms:** React Hook Form + Zod
- **Data Fetching:** Server Actions + Native fetch
- **Charts:** Recharts

---

## Backend Architecture (Medusa.js)

### Directory Structure

```
backend/
├── src/
│   ├── admin/                  # Admin UI customizations
│   ├── api/                    # Custom API routes
│   │   ├── routes/
│   │   │   ├── seller/
│   │   │   ├── commission/
│   │   │   ├── dispute/
│   │   │   └── review/
│   │   ├── middlewares/
│   │   │   ├── auth.ts
│   │   │   ├── role-check.ts
│   │   │   └── rate-limit.ts
│   │   └── index.ts
│   ├── models/                 # Custom database models
│   │   ├── seller.ts
│   │   ├── commission.ts
│   │   ├── payout.ts
│   │   ├── review.ts
│   │   └── dispute.ts
│   ├── services/               # Custom services
│   │   ├── seller.ts
│   │   ├── commission.ts
│   │   ├── payout.ts
│   │   ├── review.ts
│   │   ├── dispute.ts
│   │   └── notification.ts
│   ├── subscribers/            # Event subscribers
│   │   ├── order.ts            # Calculate commission on order
│   │   ├── payment.ts
│   │   └── notification.ts
│   ├── migrations/             # Database migrations
│   └── loaders/                # Custom loaders
├── medusa-config.js            # Medusa configuration
└── package.json
```

### Key Technologies
- **Platform:** Medusa.js
- **Language:** TypeScript
- **Database:** PostgreSQL + TypeORM
- **Cache:** Redis
- **Authentication:** JWT
- **Validation:** class-validator
- **Job Queue:** Bull (via Medusa)

---

## Data Flow Examples

### 1. Order Placement Flow

```
Buyer clicks "Place Order"
  ↓
Frontend: POST /store/carts/:id/complete
  ↓
Medusa Backend: OrderService.createFromCart()
  ↓
Order Created Event Triggered
  ↓
Order Subscriber: Calculate Commission
  ↓
CommissionService.calculateAndCreate()
  ↓
Commission Record Created
  ↓
NotificationService.sendOrderConfirmation()
  ↓
Email sent to Buyer & Seller
```

### 2. Seller Registration Flow

```
Seller fills registration form
  ↓
Frontend: POST /api/seller/register
  ↓
Backend: SellerService.create()
  ↓
Validation & Data Processing
  ↓
Create Seller Record (status: pending)
  ↓
Create User Account (role: seller)
  ↓
Send Verification Email
  ↓
Return success response
  ↓
Admin gets notification for approval
```

### 3. Commission Payout Flow

```
Seller requests payout
  ↓
Frontend: POST /api/seller/payout/request
  ↓
Backend: PayoutService.createRequest()
  ↓
Validate seller has sufficient balance
  ↓
Create Payout Record (status: requested)
  ↓
Admin gets notification
  ↓
Admin reviews and approves
  ↓
Backend: PayoutService.approve()
  ↓
Update Commission records (status: paid)
  ↓
Update Payout record (status: approved)
  ↓
Trigger payment processing
  ↓
Send confirmation to Seller
```

---

## API Design

### Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoint Structure

```
/store/*          - Public/buyer endpoints (Medusa default)
/admin/*          - Admin endpoints (Medusa default)
/api/seller/*     - Custom seller endpoints
/api/commission/* - Custom commission endpoints
/api/dispute/*    - Custom dispute endpoints
/api/review/*     - Custom review endpoints
```

### Example Endpoints

#### Seller Endpoints
- `POST /api/seller/register` - Register new seller
- `GET /api/seller/me` - Get current seller info
- `PUT /api/seller/me` - Update seller profile
- `GET /api/seller/products` - Get seller's products
- `GET /api/seller/orders` - Get seller's orders
- `GET /api/seller/earnings` - Get earnings summary
- `POST /api/seller/payout/request` - Request payout

#### Commission Endpoints
- `GET /api/commission/seller/:id` - Get seller's commissions
- `GET /api/commission/order/:id` - Get order commissions
- `PUT /api/admin/commission/:id` - Update commission (admin)

#### Review Endpoints
- `POST /api/review` - Create review
- `GET /api/review/product/:id` - Get product reviews
- `PUT /api/admin/review/:id/moderate` - Moderate review (admin)

#### Dispute Endpoints
- `POST /api/dispute` - Create dispute
- `GET /api/dispute/:id` - Get dispute details
- `POST /api/dispute/:id/message` - Add message to dispute
- `PUT /api/admin/dispute/:id/resolve` - Resolve dispute (admin)

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────┐
│  Request with JWT Token                 │
└────────────┬────────────────────────────┘
             ▼
┌─────────────────────────────────────────┐
│  Auth Middleware                        │
│  - Verify JWT signature                 │
│  - Extract user ID and role             │
│  - Attach user to request               │
└────────────┬────────────────────────────┘
             ▼
┌─────────────────────────────────────────┐
│  Role-Based Middleware                  │
│  - Check if user has required role      │
│  - Check resource ownership             │
│  - Allow/Deny access                    │
└────────────┬────────────────────────────┘
             ▼
┌─────────────────────────────────────────┐
│  Route Handler                          │
└─────────────────────────────────────────┘
```

### Security Measures

1. **Authentication**
   - JWT tokens with expiration
   - Refresh token mechanism
   - Secure password hashing (bcrypt)

2. **Authorization**
   - Role-based access control (RBAC)
   - Resource ownership checks
   - API key for admin operations

3. **Data Protection**
   - Input validation (Zod schemas)
   - SQL injection prevention (ORM)
   - XSS prevention (sanitization)
   - CSRF tokens for forms

4. **Infrastructure**
   - HTTPS only
   - CORS configuration
   - Rate limiting (Redis-based)
   - Security headers (Helmet.js)

5. **Payment Security**
   - PCI compliance (via Stripe/PayPal)
   - No credit card storage
   - Webhook signature verification

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                       CLOUDFLARE CDN                      │
│                    (Optional, for static assets)          │
└────────────────────────┬─────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                      │
│  - Next.js application                                    │
│  - Automatic deployments from main branch                │
│  - Edge network for fast global access                   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼ API Calls
┌──────────────────────────────────────────────────────────┐
│            RAILWAY / DIGITALOCEAN (Backend)               │
│  - Medusa.js application                                  │
│  - Node.js runtime                                        │
│  - Auto-scaling (if configured)                           │
└────────────┬───────────────────┬─────────────────────────┘
             │                   │
             ▼                   ▼
┌─────────────────────┐  ┌──────────────────────────────────┐
│  PostgreSQL         │  │   Redis                           │
│  (Managed Instance) │  │   (Managed Instance)              │
└─────────────────────┘  └──────────────────────────────────┘

External Services:
- Stripe/PayPal (Payments)
- SendGrid (Email)
- Twilio (SMS)
- AWS S3/Cloudinary (File Storage)
- Sentry (Error Tracking)
```

---

## Scalability Considerations

### Horizontal Scaling
- Frontend: Auto-scaled via Vercel edge network
- Backend: Multiple instances behind load balancer
- Database: Read replicas for heavy read operations
- Redis: Redis Cluster for high availability

### Performance Optimizations
- **Frontend:**
  - Image optimization (Next.js Image)
  - Code splitting
  - Static generation where possible
  - CDN for assets

- **Backend:**
  - Database query optimization
  - Redis caching for frequently accessed data
  - Pagination for large datasets
  - Background jobs for heavy operations

### Monitoring & Observability
- **Error Tracking:** Sentry
- **Application Monitoring:** New Relic / DataDog (optional)
- **Uptime Monitoring:** UptimeRobot / Pingdom
- **Logs:** Centralized logging (Logtail, Papertrail)

---

## Development Workflow

```
Developer writes code
  ↓
Git commit
  ↓
Push to feature branch
  ↓
Create Pull Request
  ↓
GitHub Actions CI
  ├── Run linting
  ├── Run tests
  └── Build check
  ↓
Code Review
  ↓
Merge to main
  ↓
Automatic Deployment
  ├── Vercel (frontend)
  └── Railway (backend)
  ↓
Production
```

---

## Backup & Disaster Recovery

### Database Backups
- Automated daily backups
- Retention: 30 days
- Point-in-time recovery capability

### Code Backups
- Git repository (GitHub)
- Multiple branches for safety

### Recovery Procedures
1. Database restore from backup
2. Redeploy application from Git
3. Restore environment variables
4. Verify functionality

---

## Future Architecture Enhancements

1. **Microservices** (if scale demands)
   - Separate commission service
   - Separate notification service
   - API Gateway

2. **Advanced Search**
   - Elasticsearch integration
   - Full-text search
   - Advanced filtering

3. **Mobile App**
   - React Native app
   - Shared API backend

4. **Analytics**
   - Data warehouse (BigQuery/Redshift)
   - BI tools integration
   - Real-time analytics

5. **Global Expansion**
   - Multi-region deployment
   - CDN for all assets
   - Localization support
