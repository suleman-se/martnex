---
name: building-storefronts
description: Load automatically when planning, researching, or implementing Medusa storefront features in Next.js (App Router, Server Components, Client Components, SDK integration, optional React Query usage). REQUIRED for all storefront development in ALL modes.
---

# Medusa Storefront Development (Next.js 16 + React 19)

Frontend integration guide for building Medusa storefronts using Next.js App Router and modern React patterns.

---

## 🧠 Core Principle (CRITICAL)

**Next.js decides WHERE data is fetched.  
This skill defines HOW Medusa APIs are called.**

- Next.js → Server vs Client architecture
- This skill → SDK usage, API correctness, data handling

---

## When to Apply

Load this skill for ANY storefront development task:

- Calling Medusa API routes
- Integrating Medusa SDK
- Implementing cart and checkout
- Handling mutations and async state
- Optional React Query usage

---

## ⚠️ CRITICAL: Next.js Architecture Rules

### 1. Server Components (DEFAULT)

Use for:
- Product listing
- Product details
- Collections
- SEO pages

Rules:
- Fetch data on the server
- React Query NOT needed
- Prefer built-in fetch (or SDK optionally)
- Leverage caching and revalidation

---

### 2. Client Components (`"use client"`)

Use ONLY for:
- Cart interactions
- Checkout flows
- User actions
- Interactive UI

Rules:
- SDK REQUIRED
- React Query OPTIONAL (recommended for complex state)

---

## Rule Categories by Priority

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Next.js Architecture | CRITICAL |
| 2 | SDK Usage | CRITICAL |
| 3 | Client Data Management | HIGH |
| 4 | Data Display | HIGH |
| 5 | Error Handling | MEDIUM |

---

## 1. Next.js Architecture (CRITICAL)

- `next-server-default` → Prefer Server Components for data fetching
- `next-client-minimal` → Use Client Components only when necessary
- `next-no-react-query-server` → NEVER use React Query in Server Components
- `next-server-actions` → Prefer Server Actions for simple mutations
- `next-hybrid-pattern` → Server fetch + client interactivity

---

## 2. SDK Usage (CRITICAL)

### Core Rule

- `sdk-client-required`  
  → ALWAYS use Medusa SDK in Client Components

- `sdk-server-optional`  
  → Server Components MAY use SDK or fetch

---

### Detailed Rules

- `sdk-existing-methods` → Use built-in SDK methods when available
- `sdk-client-fetch` → Use `sdk.client.fetch()` for custom routes
- `sdk-required-headers` → SDK handles auth headers automatically
- `sdk-no-json-stringify` → NEVER use JSON.stringify()
- `sdk-plain-objects` → Always pass plain objects
- `sdk-locate-first` → Locate SDK instance before use

---

## 3. Client Data Management (HIGH)

### React Query (OPTIONAL, NOT DEFAULT)

Use React Query ONLY when needed:

- Complex client state (cart, checkout)
- Optimistic updates
- Background refetching
- Real-time or frequently changing data

---

### React Query Rules (Client ONLY)

- `query-client-only` → Use only in Client Components
- `query-use-query` → For client-side GET requests
- `query-use-mutation` → For POST/PUT/DELETE
- `query-invalidate` → Invalidate queries after mutations
- `query-loading-states` → Handle loading and error states

---

### When NOT to use React Query

- Server Components
- Static/SEO pages
- Simple data fetching

---

## 4. Data Display (CRITICAL)

- `display-price-format`  
  → Prices are NOT in cents  
  → $49.99 = 49.99  
  → NEVER divide by 100

---

## 5. Error Handling

- `error-on-error` → Handle mutation errors
- `error-display` → Show user-friendly messages
- `error-rollback` → Use optimistic updates when needed

---

## 🔥 Critical SDK Pattern

ALWAYS pass plain objects:

```ts
// ✅ CORRECT
await sdk.client.fetch("/store/reviews", {
  method: "POST",
  body: {
    product_id: "prod_123",
    rating: 5,
  }
})

// ❌ WRONG
await sdk.client.fetch("/store/reviews", {
  method: "POST",
  body: JSON.stringify({  // ❌ NEVER DO THIS
    product_id: "prod_123",
    rating: 5,
  })
})