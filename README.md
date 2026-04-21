<div align="center">
  <h1>Martnex</h1>
  <p><strong>Next-Generation Multi-Vendor Marketplace Platform</strong></p>

  <p>
    <a href="https://github.com/suleman-se/martnex/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="#"><img src="https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen" alt="Node Version"></a>
  </p>

  <p>
    An open-source, full-stack multi-vendor marketplace platform built on <a href="https://medusajs.com">Medusa.js</a>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#contributing">Contributing</a> •
    <a href="#license">License</a>
  </p>
</div>

---

## 🚀 About Martnex

Martnex is a powerful, scalable platform that enables entrepreneurs and businesses to launch their online store in weeks, not months. Built on the modern Medusa.js e-commerce framework, Martnex provides everything you need - whether you're running a simple online store or a full multi-vendor marketplace.

### 🎯 Two Modes, One Platform

**🏪 Single Store Mode** - Perfect for your own products
- Launch your online store quickly
- You manage all products via admin
- No commission complexity
- Simple, clean, fast

**🏢 Multi-Vendor Marketplace Mode** - Build the next Etsy
- Multiple sellers can register and sell
- Automatic commission calculations
- Seller dashboards and analytics
- Complete payout management

**Switch between modes with ONE environment variable!**

### Why Martnex?

- ✅ **Open Source** - Free to use, modify, and distribute (MIT License)
- ✅ **Flexible Modes** - Single store OR multi-vendor marketplace (your choice!)
- ✅ **Built on Medusa.js v2** - Leverage the latest version with workflows and module architecture
- ✅ **Modern Tech Stack** - Next.js 16, React 19, TypeScript, PostgreSQL, Redis
- ✅ **Modular Architecture** - Enable only the features you need
- ✅ **Fully Customizable** - Own your code, customize every aspect
- ✅ **Production Ready** - Security, performance, and scalability built-in

---

## ✨ Features

### For Marketplace Owners (Admin)
- 👥 Complete user and seller management
- 💰 Flexible commission system (global, category, or seller-specific rates)
- 📊 Comprehensive analytics and reporting dashboard
- ⚖️ Dispute resolution system
- 🎛️ Platform configuration and settings
- 📈 Revenue and sales tracking

### For Sellers (Vendors)
- 🏪 Seller registration and verification
- 📦 Product management (CRUD operations)
- 💵 Earnings dashboard with commission breakdown
- 📋 Order management and fulfillment
- 💳 Payout requests and history
- 📊 Sales analytics and performance metrics
- ⭐ Customer reviews management

### For Buyers (Customers)
- 🛍️ Intuitive product browsing and search
- 🛒 Smart shopping cart with persistence
- 💳 Multiple payment options (Stripe, PayPal, Bank Transfer)
- 📦 Order tracking and history
- ⭐ Product reviews and ratings
- 🔔 Email and SMS notifications
- 👤 Anonymous checkout option

### Technical Features
- 🔐 JWT-based authentication with role-based access control (RBAC)
- 💳 Integrated payment processing (Stripe, PayPal)
- 📧 Email notifications (SendGrid/Mailgun)
- 📱 SMS notifications (Twilio)
- 📁 File storage (AWS S3 / Cloudinary)
- 🔍 Advanced product filtering and search
- 📊 Real-time notifications
- 🌐 SEO optimized
- 📱 Fully responsive design
- 🚀 Performance optimized

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js 16](https://nextjs.org/) (App Router with Turbopack)
- [React 19+](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)

**Backend:**
- [Medusa.js v2](https://medusajs.com/) (Module-first architecture, Workflows SDK)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 17+](https://www.postgresql.org/)
- [Redis 7+](https://redis.io/) (Required for events, workflows, cache)
- [MikroORM](https://mikro-orm.io/) (Medusa v2 ORM)

**Payments:**
- [Stripe](https://stripe.com/)
- [PayPal](https://www.paypal.com/)

**Deployment:**
- [Vercel](https://vercel.com/) (Frontend)
- [Railway](https://railway.app/) / [DigitalOcean](https://www.digitalocean.com/) (Backend)

---

## 🚦 Quick Start

### Option 1: Docker (Recommended)

**Prerequisites:** Docker Desktop

1. **Clone and start**
   ```bash
   git clone https://github.com/suleman-se/martnex.git
   cd martnex
   ./start.sh
   ```

2. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:9001
   - Admin Dashboard: http://localhost:7001
   - Default login: `admin@martnex.io` / `supersecret`

For more Docker commands, see [Docker Setup Guide](README.docker.md).

### Option 2: Manual Setup

**Prerequisites:** Node.js 18+, PostgreSQL 15+, Redis 7+, pnpm

1. **Clone the repository**
   ```bash
   git clone https://github.com/suleman-se/martnex.git
   cd martnex
   ```

2. **Set up the backend**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   # Choose your store mode: SINGLE_STORE or MULTI_VENDOR_MARKETPLACE
   pnpm run db:migrate
   pnpm run seed
   pnpm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   pnpm install
   cp .env.example .env.local
   # Only NEXT_PUBLIC_MEDUSA_BACKEND_URL is required — no publishable key needed
   pnpm run dev
   ```

For detailed setup instructions, see [Setup Guide](docs/SETUP_INSTRUCTIONS.md).

---

## 📚 Documentation

### Core Documentation

- **[Store Mode Configuration](docs/STORE_MODE.md)** - ⭐ Single Store vs Multi-Vendor modes
- **[Medusa.js v2 Explained](docs/MEDUSAJS_EXPLAINED.md)** - Complete Medusa v2 guide (modules, workflows, DML)
- **[Next.js 16 Explained](docs/NEXTJS16_EXPLAINED.md)** - Complete Next.js 16 guide (Turbopack, Server Components)
- **[Tailwind CSS 4.1](docs/TAILWINDCSS_4_1.md)** - Tailwind 4.1 features and setup
- **[Quick Start](docs/QUICK_START.md)** - Get started in 5 minutes
- **[Development Standards](docs/DEVELOPMENT_STANDARDS.md)** - Coding standards and best practices
- **[Package Manager Guide](docs/PACKAGE_MANAGER.md)** - Why pnpm and how to use it
- **[Testing Guide](docs/TESTING_GUIDE.md)** - 🧪 Complete testing strategy (Unit, Integration, E2E)

### Planning Documentation

- **[Project Context](PROJECT_CONTEXT.md)** - Full requirements and scope
- **[Business Rules](planning/BUSINESS_RULES.md)** - Operational logic and configurable policies
- **[Implementation Plan](planning/IMPLEMENTATION_PLAN.md)** - Phase-by-phase development roadmap
- **[Database Schema](planning/DATABASE_SCHEMA.md)** - Database design and structure
- **[Architecture](planning/ARCHITECTURE.md)** - System architecture overview
- **[Features Checklist](planning/FEATURES_CHECKLIST.md)** - Track feature implementation

---

## 🗂️ Project Structure

```
martnex/
├── backend/                 # Medusa.js v2 backend
│   ├── src/
│   │   ├── api/            # Custom API routes
│   │   ├── models/         # Database models (DML)
│   │   ├── services/       # Business logic
│   │   └── subscribers/    # Event handlers
│   └── medusa-config.ts
├── frontend/                # Next.js 16 frontend
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   └── lib/            # Utilities and helpers
│   └── package.json
├── docs/                    # Documentation
├── planning/                # Planning documents
├── README.md
├── LICENSE
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

---

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug reports, feature requests, or code contributions, we appreciate your help in making Martnex better.

Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

### Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📖 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository
- 📢 Spread the word

---

## 🛣️ Roadmap

### Phase 1: Initial Setup ✅ (v0.1.0)
- [x] Project setup and planning
- [x] Docker environment
- [x] Medusa v2.12.1 backend
- [x] Next.js 16 frontend
- [x] PostgreSQL + Redis
- [x] Complete documentation

### Phase 2: Multi-Vendor Core ✅ (v0.2.0)
- [x] Custom Medusa modules (Seller, Commission, Payout)
- [x] Store mode system (Single Store / Multi-Vendor)
- [x] Payment methods (Stripe, PayPal, COD, Bank Transfer)
- [x] API layer (20 endpoints)
- [x] Validation & audit logging
- [x] Business rules engine

### Phase 2.5: Authentication & Authorization ✅ (Complete)
- [x] JWT authentication system (Medusa native `emailpass` provider)
- [x] Role-based access control (RBAC) — buyer, seller, admin
- [x] Email verification and password reset flows
- [x] Protected API routes with `authenticate()` middleware
- [x] Custom UI component library (Button, Card, Input, Label, Badge)
- [x] Auth pages redesigned (Login, Register, Forgot/Reset Password)
- [x] Seller onboarding multi-step form
- [x] Seller dashboard (Overview, Products, Orders pages)

### Phase 3: Product Integration & Workflows (In Progress)
- [ ] Product-seller relationships and listings
- [ ] Order automation workflows
- [ ] Payment processing (Stripe/PayPal)
- [ ] Full admin dashboard
- [ ] Buyer product browsing and cart

### Phase 4: Enhanced Features
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Advanced search (Elasticsearch)
- [ ] Mobile app (React Native)
- [ ] Seller subscription plans
- [ ] Marketing tools (coupons, campaigns)

See the [Implementation Plan](planning/IMPLEMENTATION_PLAN.md) for detailed feature breakdown.

**Note:** As an open-source project, this roadmap is flexible and feature-driven rather than time-bound. Contributions are welcome at any phase!

---

## 📄 License

Martnex is open-source software licensed under the [MIT License](LICENSE).

This means you can:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

---

## 🙏 Acknowledgments

- Built on top of [Medusa.js](https://medusajs.com/) - An amazing open-source e-commerce platform
- UI components from [Shadcn/UI](https://ui.shadcn.com/)
- Inspired by the need for accessible, customizable marketplace solutions

---

## 📞 Support & Community

- 📖 [Documentation](docs/)
- 💬 [GitHub Discussions](https://github.com/suleman-se/martnex/discussions)
- 🐛 [Issue Tracker](https://github.com/suleman-se/martnex/issues)
- 🐦 [Twitter](https://twitter.com/martnex) (coming soon)
- 💼 [LinkedIn](https://linkedin.com/company/martnex) (coming soon)

---

## ⭐ Show Your Support

If you find Martnex useful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with others
- 🤝 Contributing code

---

<div align="center">
  <p>Made with ❤️ by the Martnex Community</p>
  <p>
    <a href="https://github.com/suleman-se/martnex">GitHub</a> •
    <a href="https://martnex.io">Website</a> (coming soon) •
    <a href="https://docs.martnex.io">Docs</a> (coming soon)
  </p>
</div>
