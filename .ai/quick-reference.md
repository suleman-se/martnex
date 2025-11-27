# Quick Reference for AI Assistants

## Project Identity
**Martnex** - Open-source multi-vendor marketplace (Medusa.js + Next.js + PostgreSQL)

## Tech Stack
- **Backend:** Medusa.js, Node.js 18+, TypeScript, PostgreSQL, Redis, TypeORM
- **Frontend:** Next.js 15 (App Router with Turbopack), React 19, TypeScript, TailwindCSS, Shadcn/UI
- **Package Manager:** pnpm (strictly enforced)
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **Payments:** Stripe, PayPal

## Core Commands

```bash
# Package management
pnpm install                    # Install deps
pnpm add <pkg>                  # Add package
pnpm --filter backend add <pkg> # Add to backend
pnpm --filter frontend add <pkg># Add to frontend

# Development
pnpm dev                        # Start dev server
pnpm build                      # Build for production
pnpm test                       # Run tests
pnpm audit                      # Security check

# Database
pnpm medusa migrations create   # Create migration
pnpm medusa migrations run      # Run migrations
```

## File Patterns

### Backend (Medusa.js)
- Models: `backend/src/models/seller.ts`
- Services: `backend/src/services/seller.ts`
- API Routes: `backend/src/api/routes/seller/index.ts`
- Subscribers: `backend/src/subscribers/order.ts`
- Migrations: `backend/src/migrations/1234567890-AddSellerTable.ts`

### Frontend (Next.js)
- Pages: `frontend/src/app/(group)/page.tsx`
- Components: `frontend/src/components/seller/ProductCard.tsx`
- API Client: `frontend/src/lib/api/client.ts`
- Hooks: `frontend/src/lib/hooks/useAuth.ts`
- Utils: `frontend/src/lib/utils/format-currency.ts`

## Code Style

### TypeScript
```typescript
// ✅ Good
interface Product {
  id: string
  title: string
  price: number
}

// ❌ Bad
const product: any = {...}
```

### API Response
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: { code: "ERROR_CODE", message: "..." } }
```

### Error Handling
```typescript
try {
  const result = await service.doSomething()
  return result
} catch (error) {
  if (error instanceof ValidationError) {
    throw new BadRequestError(error.message)
  }
  throw error
}
```

## User Roles
1. **Buyer** - Browse, purchase, review
2. **Seller** - Manage products, track earnings, request payouts
3. **Admin** - Manage platform, approve sellers, resolve disputes

## Key Features
- Multi-vendor product management
- Commission system (global/category/seller-specific rates)
- Seller dashboard with analytics
- Admin panel with reporting
- Review & rating system
- Dispute management
- Anonymous checkout

## Important Files
- `PROJECT_CONTEXT.md` - Requirements
- `planning/IMPLEMENTATION_PLAN.md` - Roadmap
- `planning/DATABASE_SCHEMA.md` - Database design
- `docs/API.md` - API documentation
- `.ai/instructions.md` - Full AI guidelines

## Rules
1. Use **pnpm** only (never npm/yarn)
2. **TypeScript strict mode** (no `any`)
3. **Validate all inputs** (Zod schemas)
4. **No hardcoded secrets** (use env vars)
5. **Security first** (OWASP guidelines)
6. **Simple over clever** (readability)
7. **Document as you go** (update CHANGELOG.md)
8. **No over-engineering** (build what's needed)

## Ports
- Frontend: `3000`
- Backend API: `9000`
- Admin UI: `7001`
- PostgreSQL: `5432`
- Redis: `6379`

## Environment Files
- Backend: `.env` (use `.env.example` as template)
- Frontend: `.env.local` (use `.env.local.example` as template)

## When to Ask
- Architectural decisions
- Breaking changes
- Ambiguous requirements
- Trade-offs (performance vs complexity)

## When to Proceed
- Bug fixes
- Documentation updates
- Code refactoring
- Writing tests

---

**Remember:** This is a side project. Help ship working features, not perfect code.
