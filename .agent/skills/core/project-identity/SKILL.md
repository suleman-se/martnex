---
name: project-identity
description: Load automatically for ALL Martnex development tasks to understand project philosophy, global rules, and AI assistant standards. This is the source of truth for Martnex project identity.
---

# Martnex Project Identity & Global Standards

This skill defines the high-level philosophy, core rules, and standards for the Martnex project.

## 1. Project Philosophy
- **Side Project Context:** This is an incrementally built project.
- **No Timeline Pressure:** Focus on small, working increments and shipping early/often.
- **Simplicity First:** Prefer readable, standard code over complex optimizations or over-engineering.

## 2. Core Identity
- **Martnex:** An open-source multi-vendor marketplace built on Medusa.js (v2) and Next.js (v15+).
- **Three Core Roles:** 
  1. **Buyer:** Browse, purchase, review products.
  2. **Seller:** Manage products, track earnings, request payouts.
  3. **Admin:** Manage platform, approve sellers, resolve disputes.

## 3. Global Technical Hard Rules (REQUIRED)
- **Package Manager:** **pnpm only.** Never use npm or yarn.
- **Dependencies:** ALWAYS use the latest versions (`pnpm add <pkg>@latest`). Verify latest version with `npm view <pkg> version` first.
- **TypeScript:** Strict mode is mandatory. Avoid `any` types at all costs.
- **Database:** Medusa v2 uses **MikroORM** and DML (Data Model Language).
- **E2E Testing:** Playwright is used in the `frontend` directory (`npx playwright test`).

## 4. AI Assistant Standards (How to Work)
- **Concise & Actionable:** Skip pleasantries; get to the code and solution.
- **Show, Don't Tell:** Provide code examples rather than long theoretical explanations.
- **Flag Risks:** Proactively warn about breaking changes, security vulnerabilities, or complex migrations.
- **"Fixed" Convention:** 
  - Use "Fixed" only for bugs discovered in already merged/released code.
  - Corrections during active development are part of implementation, not "fixes."

## 5. Security Principles
- No hardcoded secrets (use `.env`).
- Validate all inputs with **Zod**.
- Security-first mindset: validate inputs, sanitize outputs, follow OWASP guidelines.

## 6. Integration Checklist
- [ ] TypeScript types are correct.
- [ ] Inputs are validated (Zod).
- [ ] No console.logs in production.
- [ ] API responses follow the project format: `{ success: true, data: {...} }`.
- [ ] Documentation/CHANGELOG updated.
