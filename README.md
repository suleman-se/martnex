<div align="center">
  <h1>Martnex</h1>
  <p><strong>The Next-Generation Multi-Vendor Marketplace Platform</strong></p>

  <p>
    <a href="https://github.com/suleman-se/martnex/actions/workflows/ci.yml"><img src="https://github.com/suleman-se/martnex/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://github.com/suleman-se/martnex/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="#"><img src="https://img.shields.io/badge/Medusa-v2.13-8C4FFF" alt="Medusa v2"></a>
    <a href="#"><img src="https://img.shields.io/badge/Next.js-16.2-black" alt="Next.js 16.2"></a>
    <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/version-1.0.0-brightgreen" alt="v1.0.0"></a>
    <a href="docs/FEATURE_STATUS.md"><img src="https://img.shields.io/badge/feature_status-31_working-047857" alt="Feature Status"></a>
  </p>

  <p>
    Martnex is a high-performance, open-source e-commerce engine built on <b>Medusa.js v2</b> and <b>Next.js</b>. 
    It is designed to switch seamlessly between a high-converting <b>Single Store</b> and a complex <b>Multi-Vendor Marketplace</b>.
  </p>
</div>

---

> ### 📋 [What's actually built → Feature Status](docs/FEATURE_STATUS.md)
>
> A claim-by-claim audit of this project, verified against a **running instance** — not against
> this README. Includes what's partial, what's scaffolded, and what isn't built yet.
>
> **31 working · 4 partial · 14 declared but not built · 3 planned next**

---

## ⚡ Quick Start (Docker)

Get up and running in less than 5 minutes:

```bash
git clone https://github.com/suleman-se/martnex.git
cd martnex
./start.sh
```

- **Frontend**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:7001` (`admin@martnex.io` / `supersecret`)
- **Backend API**: `http://localhost:9001`

> **Running outside Docker?** Use Node `^20.19.0 || >=22.12.0` (see `.nvmrc`).
> The Vite 8 / Vitest 4 toolchain ships native binaries that pnpm silently skips on
> older releases, which leaves `pnpm test` unable to start.

---

## 🏪 One Platform, Two Modes

Martnex allows you to toggle your entire platform's behavior using a single environment variable (`STORE_MODE`).

- **Single Store Mode**: A streamlined experience for selling your own products. No vendor overhead, just pure performance.
- **Multi-Vendor Mode**: A full marketplace ecosystem (like Etsy or Amazon) with seller registration, automated commissions, and payout workflows.

---

## ✅ Core Features

- **🏪 Dual Store Modes**: Toggle between single-merchant e-commerce and a multi-vendor marketplace with one environment variable (`STORE_MODE`).
- **🛍️ Complete Buyer Journey**: Immersive category mega-menus, global spotlight search (⌘K), touch recommendation carousels, persistent cart drawer, multi-step checkout (Stripe/COD), order confetti receipt, and a type-safe account portal (addresses/profile/orders).
- **⚡ Modular Storefront Architecture**: `ProductCard`, `SearchSpotlight`, and `PaymentStep` fully decomposed into domain-level sub-components (`ProductCardMedia`, `ProductCardDetails`, `QuickAddVariantSelector`, `SearchInput`, `SearchFilters`, `SearchResultsList`, `PaymentMethodCard`, `StripePaymentForm`) — pure presentational leaves, container-driven state.
- **💀 Premium Loading Skeletons**: High-fidelity `SkeletonAddresses`, `SkeletonOrders`, `SkeletonProfile`, `SkeletonSavedAddresses` — exact layout mirrors with auto-inverting dark mode, `min-h-*` overflow safety, and hydration-safe static headers.
- **💼 Comprehensive Seller Center**: Onboarding verification flow, dashboard stats (commissions & aggregate revenue), product CRUD with dynamic uploader and variant generator, scoped orders management, and payouts history.
- **🛡️ Secure Platform Architecture**: JWT token refresh rotation, role-based access controllers (RBAC), Knex link modules, Nodemailer sync, and automatic commission creation hooks.
- **📱 Premium Responsive Design**: Full-screen drawers, responsive headers, obsidian dark mode (all components including button variants), and optimized layouts supporting mobile, tablet, and desktop viewports.

For a detailed release history and implementation roadmap, please see the [Changelog](CHANGELOG.md).

---

## 📚 Documentation Hub

All technical details are centralized in the `docs/` directory for clarity and maintenance.

| Category | Document |
| :--- | :--- |
| **Project Status** | **[Feature Status — built vs planned](docs/FEATURE_STATUS.md)** |
| **Strategy** | [Vision & User Roles](docs/VISION.md) • [Roadmap & Changelog](CHANGELOG.md) |
| **Getting Started** | [Quick Start Guide](docs/QUICK_START.md) • [Setup Instructions](docs/SETUP_INSTRUCTIONS.md) • [Docker Guide](docs/DOCKER_GUIDE.md) |
| **API Reference** | [API Documentation](docs/API.md) |
| **Configuration** | [Store Mode Settings](docs/STORE_MODE.md) • [Package Manager (pnpm)](docs/PACKAGE_MANAGER.md) |
| **Quality** | [Testing Strategy (Unit/E2E)](docs/TESTING_GUIDE.md) • [Development Standards](docs/DEVELOPMENT_STANDARDS.md) |
| **AI Agents** | [Agent Instructions](AGENTS.md) • [Skills Index](.agents/skills/README.md) |

---

## 🏗️ Project Structure

```bash
martnex/
├── backend/    # Medusa v2 (Custom Modules: Seller, Commission, Payout)
├── frontend/   # Next.js (Feature-Sliced Architecture, Tailwind v4)
├── docs/       # Centralized Documentation
├── .agents/    # AI agent knowledge base (.claude symlinks here)
├── AGENTS.md   # Agent entry point (CLAUDE.md symlinks here)
└── start.sh    # Idempotent Docker Orchestration
```

---

## 🤖 Built for AI Agents

Martnex ships with a first-class agent setup, so Claude Code, Cursor, Copilot and
friends land productive instead of guessing.

- **[AGENTS.md](AGENTS.md)** — the root entry point every agent reads: layout, commands,
  hard rules and the gotchas that break checkout. `CLAUDE.md` symlinks to it.
- **[`.agents/skills/`](.agents/skills/)** — 19 task-scoped skills covering Medusa v2
  internals, Next.js 16 / React 19 patterns, UI/UX standards, and the plan → build →
  test workflow. See the [skills index](.agents/skills/README.md).
- **`.claude` → `.agents`** — a symlink, so Claude Code auto-loads the same knowledge
  base every other agent reads. One source of truth, no duplication.

```bash
.agents/skills/<skill-name>/SKILL.md   # flat, one directory per skill
```

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📄 License

Martnex is open-source software licensed under the **MIT License**. Feel free to use, modify, and distribute commercially.

<div align="center">
  <p>Made with ❤️ by the Martnex Community</p>
</div>
