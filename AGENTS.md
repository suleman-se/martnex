# AGENTS.md

Instructions for AI coding agents working in this repository.
Humans: see [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

Martnex is an open-source multi-vendor marketplace on **Medusa v2** (backend) and
**Next.js 16 / React 19** (frontend). One env var (`STORE_MODE`) switches the whole
platform between single-store and marketplace behaviour.

---

## Start here

Deep, task-specific knowledge lives in [`.agents/skills/`](.agents/skills/) — 19 skills
covering Medusa internals, Next.js patterns, UI/UX standards and engineering workflow.
`.claude` is a symlink to `.agents`, so Claude Code loads them automatically; other
agents should read them directly.

**Load [`project-identity`](.agents/skills/project-identity/SKILL.md) before any task.**
It is the source of truth for architecture, conventions and known constraints.

| Working on… | Read |
| :--- | :--- |
| Medusa modules, API routes, workflows | [`medusa-core`](.agents/skills/medusa-core/SKILL.md) |
| Medusa admin dashboard UI | [`medusa-admin`](.agents/skills/medusa-admin/SKILL.md) |
| Storefront (Next.js + Medusa SDK) | [`medusa-storefront`](.agents/skills/medusa-storefront/SKILL.md) |
| Migrations, seeding, admin users | [`medusa-ops`](.agents/skills/medusa-ops/SKILL.md) |
| React/Next.js structure & performance | [`next-patterns`](.agents/skills/next-patterns/SKILL.md), [`react-best-practices`](.agents/skills/react-best-practices/SKILL.md), [`composition-patterns`](.agents/skills/composition-patterns/SKILL.md), [`next-cache`](.agents/skills/next-cache/SKILL.md) |
| Any visual/UI work | [`ui-ux-pro-max`](.agents/skills/ui-ux-pro-max/SKILL.md), [`web-design-guidelines`](.agents/skills/web-design-guidelines/SKILL.md) |
| Planning a multi-step change | [`brainstorming`](.agents/skills/brainstorming/SKILL.md) → [`writing-plans`](.agents/skills/writing-plans/SKILL.md) → [`executing-plans`](.agents/skills/executing-plans/SKILL.md) |
| Bugs and test failures | [`systematic-debugging`](.agents/skills/systematic-debugging/SKILL.md), [`test-driven-development`](.agents/skills/test-driven-development/SKILL.md), [`webapp-testing`](.agents/skills/webapp-testing/SKILL.md) |

---

## Layout

```
martnex/
├── backend/          Medusa v2 API + custom modules
│   ├── src/modules/  seller, commission, payout, account, email
│   ├── src/api/      admin/*, store/*, auth/* route handlers
│   ├── src/links/    module links extending core Medusa entities
│   └── src/workflows/  all mutations go through these
├── frontend/         Next.js App Router, feature-sliced
│   ├── src/app/      routes only — no business logic, no inline API calls
│   ├── src/components/  admin/ seller/ store/ auth/ shared/ ui/
│   └── src/hooks/    React Query data fetching
├── .agents/skills/   agent knowledge base (.claude -> .agents)
└── docs/             human documentation + plans/specs
```

---

## Commands

Run services with Docker; run tooling inside the app directories.

```bash
./start.sh                    # full first-time setup (migrations, then boot)
make up / make down / make logs
make migrate                  # db migrations
make seed                     # seed data

cd frontend && pnpm dev       # :3000
cd frontend && pnpm type-check && pnpm lint
cd frontend && pnpm test      # vitest
cd frontend && pnpm playwright test   # e2e

cd backend && pnpm dev        # :9001
cd backend && pnpm test       # vitest
cd backend && pnpm run db:migrate
cd backend && pnpm run setup-shipping   # required once; idempotent
```

Admin panel runs on :7001 (`admin@martnex.io` / `supersecret` in dev).

---

## Hard rules

These are non-negotiable. Violating them breaks the build or the checkout flow.

- **pnpm 10+ only.** Never `npm install` or `yarn`.
- **TypeScript strict.** No `any`. Validate runtime input with Zod.
- **Tailwind v4** for styling. Every component must support dark mode via `dark:`
  variants or the `globals.css` CSS variables (`bg-card`, `text-foreground`).
- **Prices are dollars, not cents.** Never multiply or divide by 100.
- **All mutations go through Medusa workflows** — never call module services directly
  from a route handler.
- **Medusa v2 store routes support GET, POST, DELETE only.** Use POST for updates.
- **Next.js 16:** App Router only; `proxy.ts` replaces `middleware.ts`; `params`,
  `searchParams`, `cookies()` and `headers()` are async — always `await`.
- **React 19:** pass `ref` as a normal prop in new components; no `forwardRef`.
- **Reuse before you create.** Search `src/components/shared` and `src/components/ui`
  before adding a component. Extract to `shared/` when a pattern appears twice.
- **No hardcoded secrets.** Use `.env` (see `.env.example`).
- **Never commit** `.env`, build output, `uploads/`, or database dumps.

---

## Gotchas

- **Docker Server Components** must call `MEDUSA_BACKEND_URL=http://backend:9001`.
  `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (localhost) is for browser-side calls only.
- **Checkout prerequisite chain:** product → sales channel → variant inventory link →
  `stocked_quantity > 0` → stock location on sales channel → fulfillment set +
  shipping options → `product_shipping_profile` row. A missing link fails checkout
  with an unhelpful error.
- **Do not set `isList: true` on `defineLink`** — it crashes MikroORM in cross-module
  contexts (Medusa 2.13.x). Use Knex `INSERT … ON CONFLICT DO NOTHING` for pivots.
- **Hydration:** client components that read browser state use the `mounted` pattern.
- **Breakpoints:** `lg:` (1024px) is the mobile→desktop flip point, not `md:`.

---

## Conventions

- **Commits:** conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`,
  `chore:`), imperative mood, first line ≤ 72 chars.
- **"Fixed"** is only for bugs in already-merged code. Corrections made during active
  development are part of the implementation, not fixes.
- **Plans and specs** go in `docs/superpowers/plans/` and `docs/superpowers/specs/`,
  named `YYYY-MM-DD-slug.md`.
- **Update [CHANGELOG.md](CHANGELOG.md)** for user-visible changes — add to `[Unreleased]`,
  never edit a released section.
- **Versions are semver, not phase numbers.** A release bumps `backend/package.json`,
  `frontend/package.json` and the README badge together; all four (including the CHANGELOG
  heading) must agree. Current: **1.0.0**.
- Verify your work: `pnpm type-check` and `pnpm lint` in the affected app before
  reporting a task complete.
