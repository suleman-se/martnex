# Project Context & Requirements

## Project Name
Martnex - Next-Generation Multi-Vendor Marketplace Platform

## Objective
Build a scalable, secure multi-vendor marketplace with custom commission logic, role-based access, and comprehensive e-commerce features using Medusa.js as the foundation.

## Why Medusa.js?
- **Stack Match:** Node.js + React/Next.js (exactly what we need)
- **MIT License:** Full code ownership, zero restrictions
- **Time Savings:** 60-70% reduction in development time
- **Built-in Features:** Product catalog, cart, checkout, payments, admin dashboard
- **Customizable:** Modular architecture allows custom extensions

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

## Core Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Secure password handling
- Email verification
- Password reset functionality

### Product Management
- Product listings with images
- Categories and tags
- Smart filters (price, category, rating, etc.)
- Inventory management
- Product variants (size, color, etc.)
- Search functionality

### Shopping & Checkout
- Shopping cart (persistent)
- Secure checkout flow
- Multiple payment gateways:
  - Stripe
  - PayPal
  - Local bank transfer
- Order confirmation emails
- Invoice generation

### Commission System
- Custom commission logic
- Configurable commission rates per category/seller
- Automatic commission calculation
- Payout tracking
- Commission reports

### Order Management
- Order tracking
- Order status updates
- Order history
- Anonymous order handling
- Return/refund processing

### Dashboards

#### Buyer Dashboard
- Order history
- Order tracking
- Profile management
- Saved addresses
- Wishlist

#### Seller Dashboard
- Product management
- Order management
- Sales analytics
- Earnings overview
- Payout history
- Customer reviews

#### Admin Panel
- User management
- Product approval/moderation
- Order oversight
- Dispute resolution
- Platform analytics
- Commission configuration
- System settings

### Notifications
- Email notifications (order confirmations, status updates)
- SMS notifications (optional, using Twilio)
- Real-time notifications (for urgent updates)
- Notification preferences per user

### Reporting & Analytics
- Sales reports (daily, weekly, monthly)
- User activity tracking
- Revenue analytics
- Commission reports
- Popular products
- Seller performance metrics

### Additional Features
- Review & rating system
- Dispute management system
- Anonymous order option
- Multi-language support (future)
- Mobile responsive design
- SEO optimization

## Technical Requirements

### Frontend
- **Framework:** Next.js 16 (App Router with Turbopack)
- **UI Library:** React 19+
- **Styling:** TailwindCSS + Shadcn/UI
- **State Management:** React Context / Zustand
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts / Chart.js

### Backend
- **Platform:** Medusa.js
- **Runtime:** Node.js 18+
- **API:** REST (Medusa default) + custom endpoints
- **Authentication:** JWT
- **File Upload:** AWS S3 / Cloudinary

### Database
- **Primary:** PostgreSQL
- **ORM:** Medusa's built-in (TypeORM)
- **Caching:** Redis (for sessions and cart)

### Payment Gateways
- Stripe (primary)
- PayPal
- Local bank transfer (custom integration)

### Third-Party Services
- **Email:** SendGrid / Mailgun
- **SMS:** Twilio
- **Storage:** AWS S3 / Cloudinary
- **Monitoring:** Sentry (error tracking)
- **Analytics:** Google Analytics / Mixpanel

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway / DigitalOcean / AWS
- **Database:** Managed PostgreSQL (DigitalOcean/AWS RDS)
- **CI/CD:** GitHub Actions

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

## What Medusa.js Provides Out-of-the-Box

✅ **Already Built:**
- Product catalog and management
- Shopping cart
- Checkout flow
- Order management
- Customer accounts
- Payment processing (Stripe, PayPal plugins available)
- Admin dashboard
- REST API
- Authentication foundation
- Inventory management
- Multi-region support
- Tax calculation
- Shipping options

## What We Need to Build Custom

🔨 **Custom Development Required:**
- Seller dashboard and registration
- Multi-vendor logic (product-to-seller mapping)
- Commission calculation engine
- Commission payout system
- Enhanced admin panel (user management, disputes)
- Reporting dashboard (custom analytics)
- Review & rating system (extend Medusa)
- Dispute management workflow
- Anonymous order handling
- SMS notifications integration
- Custom UI/UX theme
- Local bank payment integration
- Real-time notification system

## Success Metrics
- Platform successfully supports multiple sellers
- Commission system accurately calculates and tracks payouts
- All three user roles can perform their tasks seamlessly
- Payment processing is secure and reliable
- Platform is scalable and performant
- Code is well-documented and maintainable

## Development Approach
This is an **open-source project** built incrementally at your own pace. There are no strict timelines; work on features as time permits between paid projects. The implementation is organized into modular phases that can be completed independently.

## Budget Considerations
- Open-source foundation = $0 licensing costs
- Medusa.js = free, MIT license
- Third-party services = variable (SendGrid, Twilio, AWS)
- Deployment costs = ~$50-200/month initially

## Risks & Mitigation
| Risk | Mitigation |
|------|------------|
| Medusa.js limitations | Evaluate thoroughly before committing |
| Custom multi-vendor complexity | Start simple, iterate based on feedback |
| Payment integration issues | Use Medusa's tested plugins first |
| Feature scope creep | Focus on MVP features, defer nice-to-haves |
| Security vulnerabilities | Follow OWASP guidelines, regular code reviews |
| Burnout from side project | Work in small increments, celebrate progress |

## Next Steps
1. Set up development environment
2. Install and configure Medusa.js
3. Evaluate Medusa's capabilities vs requirements
4. Begin Phase 1 implementation
