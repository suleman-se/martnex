# AI Assistant Instructions for Martnex

This document provides guidelines for AI assistants working on the Martnex project.

## Project Overview

**Martnex** is an open-source multi-vendor marketplace platform built on Medusa.js and Next.js. It enables entrepreneurs to launch their own marketplace with features like commission management, role-based access, and comprehensive e-commerce functionality.

### Key Information
- **License:** MIT (fully open-source)
- **Tech Stack:** Medusa.js (backend), Next.js 15 (frontend), PostgreSQL, Redis, TypeScript
- **Package Manager:** pnpm (strictly enforced)
- **Development Approach:** Incremental, no strict timelines, feature-driven
- **Target Users:** 3 roles (Buyer, Seller, Admin)

## Core Principles

### 1. Development Philosophy
- This is a **side project** built incrementally between paid work
- **No timeline pressure** - work at the developer's pace
- Focus on **small, working increments** over large features
- **Ship early and often** - prefer working MVP over perfect code
- **Document as you go** - keep docs updated with changes

### 2. Code Quality Standards
- **TypeScript** for all new code (strict mode)
- **Functional and declarative** over imperative
- **Simple over clever** - readability first
- **No over-engineering** - build what's needed, not what might be needed
- **Security-first** - validate inputs, sanitize outputs, follow OWASP guidelines

### 3. Communication Style
- **Concise and actionable** - avoid long explanations unless asked
- **Show, don't tell** - provide code examples
- **Assume competence** - developer knows Node.js, React, TypeScript
- **Flag risks** - warn about breaking changes, security issues, or complex migrations
- **No fluff** - skip pleasantries, get to the solution

## Project Structure

```
martnex/
├── backend/          (to be created - Medusa.js)
├── frontend/         (to be created - Next.js)
├── packages/         (to be created - shared code)
├── docs/             (documentation)
├── planning/         (architecture, schemas, roadmap)
├── .ai/              (AI instructions)
└── [root config files]
```

## Technical Guidelines

### Package Management
- **Always use pnpm** (never npm or yarn)
- Use workspace features for monorepo structure
- Keep dependencies minimal and up-to-date
- Run `pnpm audit` before suggesting new packages

### Code Style
- **Formatting:** Prettier (see .prettierrc when created)
- **Linting:** ESLint (see .eslintrc when created)
- **TypeScript:** Strict mode, no `any` types
- **Naming:**
  - Components: PascalCase (e.g., `ProductCard.tsx`)
  - Functions: camelCase (e.g., `calculateCommission`)
  - Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_COMMISSION_RATE`)
  - Files: kebab-case for utils (e.g., `format-currency.ts`)

### Database
- Use **TypeORM** (Medusa's ORM)
- **Always create migrations** for schema changes
- Follow naming in `planning/DATABASE_SCHEMA.md`
- Use JSONB for flexible metadata
- Add indexes for foreign keys and frequently queried fields

### API Design
- Follow REST conventions
- Use proper HTTP status codes
- Validate inputs with Zod schemas
- Return consistent response format:
  ```typescript
  // Success
  { success: true, data: {...} }

  // Error
  { success: false, error: { code: "ERROR_CODE", message: "...", details: {} } }
  ```

### Security
- **Never hardcode secrets** - use environment variables
- **Validate all inputs** - client and server side
- **Sanitize outputs** - prevent XSS
- **Use parameterized queries** - prevent SQL injection
- **Implement rate limiting** - protect against abuse
- **Hash passwords** - bcrypt with minimum 10 rounds
- **Verify JWT tokens** - check signature and expiration

### Testing
- Write tests for critical logic (commission calculations, payments)
- Test edge cases and error scenarios
- Use descriptive test names: `it('should calculate 10% commission on $100 order')`
- Mock external services (Stripe, SendGrid, etc.)

## File Organization

### Backend (Medusa.js)
```
backend/
├── src/
│   ├── api/              # Custom API routes
│   │   └── routes/
│   │       ├── seller/
│   │       ├── commission/
│   │       └── dispute/
│   ├── models/           # Database models
│   │   ├── seller.ts
│   │   ├── commission.ts
│   │   └── ...
│   ├── services/         # Business logic
│   │   ├── seller.ts
│   │   └── commission.ts
│   ├── subscribers/      # Event handlers
│   │   └── order.ts      # Calculate commission on order
│   └── migrations/       # Database migrations
└── medusa-config.js
```

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/              # App Router
│   │   ├── (auth)/
│   │   ├── (shop)/       # Buyer pages
│   │   ├── (seller)/     # Seller dashboard
│   │   └── (admin)/      # Admin panel
│   ├── components/
│   │   ├── ui/           # Shadcn components
│   │   ├── shared/
│   │   ├── buyer/
│   │   ├── seller/
│   │   └── admin/
│   ├── lib/
│   │   ├── api/          # API client
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utilities
│   │   └── validators/   # Zod schemas
│   └── store/            # State management
└── package.json
```

## Common Tasks

### Adding a New Feature

1. **Check the plan** - Review `planning/IMPLEMENTATION_PLAN.md`
2. **Update checklist** - Mark feature in `planning/FEATURES_CHECKLIST.md`
3. **Design first** - Think through data model, API endpoints, UI
4. **Backend first** - Create model, migration, service, API route
5. **Test backend** - Use Thunder Client or Postman
6. **Frontend next** - Create UI, connect to API
7. **Test end-to-end** - Full user flow
8. **Update docs** - Add to `docs/API.md`, update CHANGELOG.md

### Creating Database Migrations

```bash
# Generate migration
cd backend
pnpm medusa migrations create AddSellerTable

# Edit the migration file in src/migrations/

# Run migration
pnpm medusa migrations run
```

### Adding Dependencies

```bash
# Backend
pnpm --filter backend add <package-name>

# Frontend
pnpm --filter frontend add <package-name>

# Check for vulnerabilities
pnpm audit
```

### Environment Variables

- Add to `.env.example` (backend) or `.env.local.example` (frontend)
- Document what each variable does
- Never commit actual `.env` files
- Use descriptive names (e.g., `STRIPE_SECRET_KEY` not `SK`)

## Decision-Making Guidelines

### When to Ask the Developer

- **Architectural decisions** - Which approach to use for a feature
- **Breaking changes** - Anything that changes existing APIs
- **Ambiguous requirements** - Multiple valid interpretations
- **Third-party services** - Choosing between services (e.g., SendGrid vs Mailgun)
- **Trade-offs** - Performance vs complexity, cost vs features

### When to Proceed Autonomously

- **Bug fixes** - Obvious errors with clear solutions
- **Code refactoring** - Improving existing code without changing behavior
- **Documentation** - Adding or updating docs
- **Tests** - Writing tests for existing code
- **Minor improvements** - Small UX improvements, better error messages

### When to Suggest Alternatives

- **Better library exists** - More maintained, lighter, faster
- **Simpler approach** - Less code, easier to understand
- **Security improvement** - More secure alternative
- **Performance optimization** - Faster approach with similar complexity

## Code Review Checklist

Before presenting code, verify:

- [ ] TypeScript types are correct (no `any`)
- [ ] Inputs are validated (Zod schemas)
- [ ] Errors are handled gracefully
- [ ] No hardcoded values (use env vars or constants)
- [ ] No console.logs in production code
- [ ] Database queries are optimized (avoid N+1)
- [ ] API responses are consistent
- [ ] Security best practices followed
- [ ] Code is readable and well-commented
- [ ] Tests are written (for critical logic)

## Error Handling Patterns

### Backend (Medusa/Express)
```typescript
// API Route
try {
  const result = await service.doSomething(data)
  res.json({ success: true, data: result })
} catch (error) {
  if (error instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.message }
    })
  }
  // Log error (use proper logger)
  console.error('Unexpected error:', error)
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' }
  })
}
```

### Frontend (React)
```typescript
// Component
const [error, setError] = useState<string | null>(null)

try {
  const result = await api.doSomething(data)
  // Handle success
} catch (err) {
  const message = err instanceof Error ? err.message : 'An error occurred'
  setError(message)
  toast.error(message)
}
```

## Documentation Standards

### Code Comments
- Explain **why**, not what
- Document complex logic and business rules
- Use JSDoc for functions and classes
- Keep comments up-to-date

### API Documentation
- Update `docs/API.md` for new endpoints
- Include request/response examples
- Document error codes
- Show authentication requirements

### Changelog
- Update `CHANGELOG.md` for all changes
- Use categories: Added, Changed, Fixed, Removed, Security
- Keep under [Unreleased] until version release

## Git Workflow

### Commit Messages
Format: `type(scope): description`

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Maintenance tasks

Examples:
```
feat(seller): add seller registration endpoint
fix(commission): correct calculation for partial refunds
docs(api): update authentication endpoints
refactor(utils): simplify date formatting helper
```

### Branching
- `main` - Production-ready code
- `develop` - Development branch (if using)
- `feature/feature-name` - Feature branches
- `fix/bug-name` - Bug fix branches

## Helpful Context

### Medusa.js Specifics
- Built on Express.js
- Uses TypeORM for database
- Event-driven architecture (subscribers)
- Admin UI at port 7001
- API at port 9000

### Next.js 16 App Router
- Server components by default (with async support)
- Client components need `'use client'`
- File-based routing in `app/` directory
- Route groups with `(group-name)/`
- Turbopack for faster dev builds
- Partial prerendering (PPR) support
- Enhanced caching strategies

### Commission System Logic
The core unique feature of Martnex is the commission system:
1. Order placed → `order.placed` event
2. Subscriber calculates commission based on rates
3. Creates commission record (status: pending)
4. Seller requests payout
5. Admin approves payout
6. Commission status → paid

### User Roles & Permissions
- **Buyer** - Browse, purchase, review products
- **Seller** - Manage products, view earnings, request payouts
- **Admin** - Oversee platform, approve sellers, resolve disputes

## Common Pitfalls to Avoid

1. **Don't mix package managers** - Only pnpm
2. **Don't skip migrations** - Always create migrations for schema changes
3. **Don't hardcode secrets** - Use environment variables
4. **Don't use `any` type** - Properly type TypeScript
5. **Don't forget validation** - Validate on both client and server
6. **Don't ignore security** - Follow OWASP guidelines
7. **Don't over-optimize early** - Make it work, then make it fast
8. **Don't create files unnecessarily** - Prefer editing existing files

## Resources

### Documentation
- Medusa Docs: https://docs.medusajs.com
- Next.js Docs: https://nextjs.org/docs
- TypeORM Docs: https://typeorm.io
- Zod Docs: https://zod.dev
- Shadcn/UI: https://ui.shadcn.com

### Project Files
- `PROJECT_CONTEXT.md` - Full requirements
- `planning/IMPLEMENTATION_PLAN.md` - Phase-by-phase roadmap
- `planning/DATABASE_SCHEMA.md` - Database design
- `planning/ARCHITECTURE.md` - System architecture
- `docs/API.md` - API endpoints
- `PACKAGE_MANAGER.md` - pnpm usage guide

## AI Assistant Behavior

### Do:
- ✅ Provide working code examples
- ✅ Explain trade-offs when multiple approaches exist
- ✅ Flag security concerns immediately
- ✅ Suggest tests for critical logic
- ✅ Keep responses focused and actionable
- ✅ Update documentation when making changes
- ✅ Use TypeScript with proper types
- ✅ Follow the established patterns in the codebase

### Don't:
- ❌ Make assumptions about unclear requirements
- ❌ Suggest deprecated packages or patterns
- ❌ Introduce unnecessary complexity
- ❌ Ignore error handling
- ❌ Skip input validation
- ❌ Use `any` type in TypeScript
- ❌ Create new files when editing existing ones would work
- ❌ Add features not in the requirements

## Version History

- **v1.0** - Initial AI instructions (2024-11-26)

---

**Note to AI Assistants:** This is a passion project built incrementally. Prioritize working code over perfect code. Help the developer ship features, not get stuck in analysis paralysis. Be a productive pair programmer, not a perfectionist.
