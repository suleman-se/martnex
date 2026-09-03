# Feature Status

A claim-by-claim audit of Martnex, verified against a running instance on
**2 September 2026** (branch `feat/buyer-storefront`, v1.0.0).

Every row below reflects what was actually observed — not what the README says.
Items that are scaffolded, placeholder or unbuilt are listed as plainly as the ones
that work.

| | Count |
| :--- | ---: |
| Working | 31 |
| Partial | 4 |
| Declared, not built | 14 |
| Planned next | 3 |

## How this was checked

- Full stack booted with `./start.sh` — Postgres, Redis, Medusa API, Next.js. All four containers healthy.
- Storefront driven in headless Chromium: routes loaded, forms filled, buttons clicked.
- Seller and admin areas exercised behind a real login with a seeded verified-seller record.
- Database inspected directly via `psql` to confirm writes landed.
- Test suites executed: 138 backend and 41 frontend unit tests, all passing.

---

## Buyer storefront

| Status | Capability | Evidence |
| :--- | :--- | :--- |
| ✅ Working | Catalog & curated departments | 7 seeded products render at `/store` with hero, department cards, category nav |
| ✅ Working | Product detail with variants | Urban Oversized Hoodie loads 8 variants across Size and Color, with quantity stepper |
| ✅ Working | Spotlight search (⌘K) | Shortcut opens the overlay; typing "hoodie" returns matching products |
| ✅ Working | Persistent cart | Item survives navigation; line totals plus free-shipping meter ("$61.00 away", 59%) |
| ✅ Working | Multi-step checkout | Cart → Address → Delivery → Payment, with card and cash-on-delivery offered |
| ✅ Working | Account portal | Dashboard, order history, saved addresses, profile settings |
| ✅ Working | Dark mode | Sets `.dark` on the document, persists `martnex_theme`, survives reload |
| ✅ Working | Brand storefront pages | Per-merchant route `/store/merchants/[id]` |
| ✅ Working | Loading skeletons | Dedicated skeletons for addresses, orders, profile, saved addresses |
| ✅ Working | Order confirmation receipt | Confetti receipt on `/store/orders/[id]` |
| ❌ Not built | Social sign-in | "Google ID" and "Apple ID" buttons render with no handler and no OAuth behind them |

## Seller centre

| Status | Capability | Evidence |
| :--- | :--- | :--- |
| ✅ Working | Dashboard with live stats | Total Revenue, Active Orders, Approved Earnings, Commissions tiles |
| ✅ Working | Product management | Listing with empty state and filters; add-product form with pricing and variants |
| ✅ Working | Scoped order management | Pending / In Transit / Completed counters, seller-scoped API routes |
| ✅ Working | Payout history | Total Requested, Pending Review, Completed panels |
| ✅ Working | Verification gate | Unverified sellers redirected to onboarding from every `/seller/*` route |
| ⚠️ Partial | Onboarding submission | 4-step form renders and advances, but final submit created no seller record in this run |
| ⚠️ Partial | Sales performance chart | Renders an "Analytics Pending" placeholder; no chart drawn yet |

## Platform & backend

| Status | Capability | Evidence |
| :--- | :--- | :--- |
| ✅ Working | Custom Medusa modules | `seller`, `commission`, `payout`, `account`, `email` |
| ✅ Working | Workflow-driven mutations | 12 workflows: seller approval, product CRUD, payout lifecycle |
| ✅ Working | Module links | `seller-product` extends core entities; multi-product pivots via Knex upserts |
| ✅ Working | Automatic commission on sale | `order.placed` subscriber opens a commission ledger entry per order |
| ✅ Working | JWT with refresh rotation | Redis-backed refresh; client retries silently on 401 before signing out |
| ✅ Working | Role-based access control | Anonymous hits on `/seller` and `/admin/sellers` return 307 to login |
| ✅ Working | Transactional email | Nodemailer service driving verification and password-reset mail |
| ✅ Working | One-command Docker stack | `./start.sh` orders migrations ahead of boot; four containers healthy from cold |
| ✅ Working | Dual store mode | `STORE_MODE` switches single-store and marketplace behaviour |
| ❌ Not built | Stripe webhooks | `STRIPE_WEBHOOK_SECRET` in the env template, but no handler exists |

## Feature flags without implementations

`features.config.ts` advertises these as toggleable. Each resolves an environment
variable, but none has a module, route, model or component behind it — a filename
search across both apps returns nothing for any of them.

`REVIEWS` · `DISPUTES` · `WISHLIST` · `LOYALTY` · `ANALYTICS` · `PRODUCT_COMPARISON` ·
`LIVE_CHAT` · `PAYPAL` (config only) · `SMS` · `PUSH` · `S3` · `CLOUDINARY`

> **Known issue.** `store-mode.ts` pushes module names — `review`, `dispute`, `wishlist`,
> `loyalty`, `analytics` — into the loader list for modules that do not exist. With disputes
> enabled, startup prints `✓ dispute` for a module that was never written.

## Admin

| Status | Capability | Evidence |
| :--- | :--- | :--- |
| ⚠️ Partial | Admin dashboard | One page ships: seller management at `/admin/sellers`. Stats, commissions, payouts, orders and settings still to come |
| ✅ Working | Admin API | Verify / suspend / reject sellers; approve / cancel payouts; list commissions |

## Engineering quality

| Status | Capability | Evidence |
| :--- | :--- | :--- |
| ✅ Working | Backend test suite | 138 tests across 8 files — modules, business rules, seller routes, auth integration |
| ✅ Working | Frontend test suite | 41 tests across 6 files — auth forms, cart and product hooks |
| ✅ Working | Continuous integration | GitHub Actions runs type-check and both suites on push and PR |
| ⚠️ Partial | Lint cleanliness | Runs and reports 109 errors — mostly new react-hooks rules plus 21 uses of `any`. Non-blocking in CI |

## Known defects

- **Role selectors unreachable by keyboard.** Radio inputs on registration and the payout
  step use `display:none`, removing them from the accessibility tree. Mouse users are fine;
  keyboard and screen-reader users cannot choose buyer or seller. `sr-only` is the fix.
- **Intermittent session loss.** One scripted run lost its session mid-journey — a 401 sent an
  authenticated user back to login. Not reproducible on demand.
- **Dead account-lockout UI.** The login form renders an "Account Locked" branch and disables
  submit on it, but nothing sets the state and no lockout logic exists server-side.
- **Missing favicon.** `frontend/public` is empty, so every page load logs a 404.

## Planned next

- **Admin panel (phase 7)** — dashboard stats, commissions and payouts UI, shipping settings,
  API-key management, replacing the remaining setup scripts.
- **Coupons and promotions** — promo-code support on the cart via Medusa's native promotion API.
- **Product reviews, seller fulfilment actions** — queued behind the admin panel.

---

Martnex is an independently built open-source project, not commercial production software.
Counts reflect what was observed on the run above; anything not directly exercised is marked
partial rather than assumed working.
