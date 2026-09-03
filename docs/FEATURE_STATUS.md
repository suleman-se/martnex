# Feature Status

A claim-by-claim audit of Martnex, verified against a running instance on
**2 September 2026** (branch `feat/buyer-storefront`, v1.0.0).

Every row below reflects what was actually observed — not what the README says.
Items that are scaffolded, placeholder or unbuilt are listed as plainly as the ones
that work.

| | Count |
| :--- | ---: |
| Working | 33 |
| Partial | 4 |
| Declared, not built | 13 |
| Planned next | 7 |

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
| ✅ Working | Account portal | Dashboard, order history, saved addresses, profile settings. Stat tiles (orders, pending shipments, total spent) are computed from real order data |
| ✅ Working | Dark mode | Sets `.dark` on the document, persists `martnex_theme`, survives reload |
| ✅ Working | Brand storefront pages | Per-merchant route `/store/merchants/[id]`. Catalogue size, join date and verification standing all read from the seller record — the seller rating is the real aggregate across that merchant's reviews, and is hidden entirely until reviews exist |
| ✅ Working | Loading skeletons | Dedicated skeletons for addresses, orders, profile, saved addresses |
| ✅ Working | Order confirmation receipt | Confetti receipt on `/store/orders/[id]` |
| ✅ Working | Product reviews & ratings | Signed-in customers rate 1–5 with an optional title and body. One review per customer per product, verified-purchase badge when an order matches, and a live average plus star distribution on the product page |
| ✅ Working | Newsletter subscribe | Footer form posts to `POST /store/newsletter` with validation and success/error states. No mailing-list provider is wired up yet — the address is accepted and logged |
| ✅ Working | Footer catalogue links | Derived from the store's real product categories rather than a hardcoded list |
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
search across both apps returns nothing for any of them. (`REVIEWS` was on this list
and is now a real module.)

`DISPUTES` · `WISHLIST` · `LOYALTY` · `ANALYTICS` · `PRODUCT_COMPARISON` ·
`LIVE_CHAT` · `PAYPAL` (config only) · `SMS` · `PUSH` · `S3` · `CLOUDINARY`

> **Fixed.** `store-mode.ts` previously pushed `review`, `dispute`, `wishlist`, `loyalty` and
> `analytics` into the loader list for modules that did not exist, so startup could print
> `✓ dispute` for a module that was never written. The list now names only modules that
> actually ship — `seller`, `commission`, `payout` and `review`.

## Admin

| Status | Capability | Evidence |
| :--- | :--- | :--- |
| ⚠️ Partial | Admin dashboard | One page ships: seller management at `/admin/sellers`. Stats, commissions, payouts, orders and settings still to come |
| ✅ Working | Admin API | Verify / suspend / reject sellers; approve / cancel payouts; list commissions |

## Engineering quality

| Status | Capability | Evidence |
| :--- | :--- | :--- |
| ✅ Working | Backend test suite | 151 tests across 9 files — modules, business rules, seller routes, reviews, auth integration |
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

Six of the ten tasks in the buyer-storefront completion plan remain. Four (real merchant
trust signals, newsletter subscribe, removing the mock savings index, and real footer
categories) were completed and are reflected above.

| Priority | Task | Notes |
| :--- | :--- | :--- |
| Critical | Order cancel flow | `POST /store/orders/:id/cancel` with ownership and status guards, plus cancel actions in the account and order pages |
| High | Reorder ("Buy Again") | Re-add a past order's line items to the cart in one action |
| High | Coupon / promo code at checkout | Promo-code entry on the cart via Medusa's native promotion API |
| Nice-to-have | Order invoice download | Downloadable invoice from the order detail page |
| Nice-to-have | Merchant location | Capture real location in seller metadata during onboarding — the hardcoded location has been removed, but no real field replaces it yet |
| Nice-to-have | Product share button | Share a product via the Web Share API with a clipboard fallback |

Beyond the storefront:

- **Admin panel (phase 7)** — dashboard stats, commissions and payouts UI, shipping settings,
  API-key management, replacing the remaining setup scripts.
- **Review moderation UI** — the data model supports rejecting a review; no admin screen exposes it yet.

---

Martnex is an independently built open-source project, not commercial production software.
Counts reflect what was observed on the run above; anything not directly exercised is marked
partial rather than assumed working.
