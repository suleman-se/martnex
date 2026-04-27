<div align="center">
  <h1>Martnex</h1>
  <p><strong>The Next-Generation Multi-Vendor Marketplace Platform</strong></p>

  <p>
    <a href="https://github.com/suleman-se/martnex/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <a href="#"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="#"><img src="https://img.shields.io/badge/Medusa-v2-8C4FFF" alt="Medusa v2"></a>
    <a href="#"><img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js"></a>
  </p>

  <p>
    Martnex is a high-performance, open-source e-commerce engine built on <b>Medusa.js v2</b> and <b>Next.js</b>. 
    It is designed to switch seamlessly between a high-converting <b>Single Store</b> and a complex <b>Multi-Vendor Marketplace</b>.
  </p>
</div>

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

---

## 🏪 One Platform, Two Modes

Martnex allows you to toggle your entire platform's behavior using a single environment variable (`STORE_MODE`).

- **Single Store Mode**: A streamlined experience for selling your own products. No vendor overhead, just pure performance.
- **Multi-Vendor Mode**: A full marketplace ecosystem (like Etsy or Amazon) with seller registration, automated commissions, and payout workflows.

---

## 📚 Documentation Hub

All technical details are centralized in the `docs/` directory for clarity and maintenance.

| Category | Document |
| :--- | :--- |
| **Strategy** | [Vision & User Roles](docs/VISION.md) • [Roadmap & Changelog](CHANGELOG.md) |
| **Getting Started** | [Quick Start Guide](docs/QUICK_START.md) • [Setup Instructions](docs/SETUP_INSTRUCTIONS.md) • [Docker Guide](docs/DOCKER_GUIDE.md) |

| **Configuration** | [Store Mode Settings](docs/STORE_MODE.md) • [Package Manager (pnpm)](docs/PACKAGE_MANAGER.md) |
| **Quality** | [Testing Strategy (Unit/E2E)](docs/TESTING_GUIDE.md) • [Development Standards](docs/DEVELOPMENT_STANDARDS.md) |
| **Technology** | [Medusa v2 Guide](docs/MEDUSAJS_EXPLAINED.md) • [Next.js 16/React 19](docs/NEXTJS16_EXPLAINED.md) |

---

## 🏗️ Project Structure

```bash
martnex/
├── backend/    # Medusa v2 (Custom Modules: Seller, Commission, Payout)
├── frontend/   # Next.js (Feature-Sliced Architecture, Tailwind v4)
├── docs/       # Centralized Documentation
└── start.sh    # Idempotent Docker Orchestration
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
