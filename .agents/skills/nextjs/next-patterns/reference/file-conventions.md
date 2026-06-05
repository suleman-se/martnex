# File Conventions

Next.js App Router uses file-based routing with special file conventions.

## Project Structure

Reference: https://nextjs.org/docs/app/getting-started/project-structure

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page (/)
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── not-found.tsx       # 404 UI
├── global-error.tsx    # Global error UI
├── route.ts            # API endpoint
├── template.tsx        # Re-rendered layout
├── default.tsx         # Parallel route fallback
├── blog/
│   ├── page.tsx        # /blog
│   └── [slug]/
│       └── page.tsx    # /blog/:slug
└── (group)/            # Route group (no URL impact)
    └── page.tsx
```

## Special Files

| File | Purpose |
|------|---------|
| `page.tsx` | UI for a route segment |
| `layout.tsx` | Shared UI for segment and children |
| `loading.tsx` | Loading UI (Suspense boundary) |
| `error.tsx` | Error UI (Error boundary) |
| `not-found.tsx` | 404 UI |
| `route.ts` | API endpoint |
| `template.tsx` | Like layout but re-renders on navigation |
| `default.tsx` | Fallback for parallel routes |
| `proxy.ts` | Request proxy / auth guard (**v16+**, was `middleware.ts` in v15 and earlier) |

## Route Segments

```
app/
├── blog/               # Static segment: /blog
├── [slug]/             # Dynamic segment: /:slug
├── [...slug]/          # Catch-all: /a/b/c
├── [[...slug]]/        # Optional catch-all: / or /a/b/c
└── (marketing)/        # Route group (ignored in URL)
```

## Parallel Routes

```
app/
├── @analytics/
│   └── page.tsx
├── @sidebar/
│   └── page.tsx
└── layout.tsx          # Receives { analytics, sidebar } as props
```

## Intercepting Routes

```
app/
├── feed/
│   └── page.tsx
├── @modal/
│   └── (.)photo/[id]/  # Intercepts /photo/[id] from /feed
│       └── page.tsx
└── photo/[id]/
    └── page.tsx
```

Conventions:
- `(.)` - same level
- `(..)` - one level up
- `(..)(..)` - two levels up
- `(...)` - from root

## Private Folders

```
app/
├── _components/        # Private folder (not a route)
│   └── Button.tsx
└── page.tsx
```

Prefix with `_` to exclude from routing.

## Middleware / Proxy

### Next.js 14-15: `middleware.ts` (deprecated in v16)

```ts
// middleware.ts (root of project)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth, redirects, rewrites, etc.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### Next.js 16+: `proxy.ts` (replaces middleware.ts)

Renamed for clarity — same `NextRequest`/`NextResponse` API. Config key is still `config` (not `proxyConfig`). Use `NextProxy` type for automatic type inference:

```ts
// proxy.ts (root of project, or src/proxy.ts)
import { NextResponse } from 'next/server';
import type { NextRequest, NextProxy } from 'next/server';

export const proxy: NextProxy = (request: NextRequest) => {
  // Same logic as before
  return NextResponse.next();
};

// Config key is still `config` — NOT `proxyConfig`
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

| Version | File | Export | Config key | Runtime |
|---------|------|--------|------------|---------|
| v14-15 | `middleware.ts` | `middleware()` | `config` | Edge (default) |
| v16+ | `proxy.ts` | `proxy()` | `config` | Node.js (default) |

> `middleware.ts` still works in v16 (deprecated, Edge runtime only). Prefer `proxy.ts` for all new code.

**Migration codemod**: `npx @next/codemod@canary middleware-to-proxy .`

## File Conventions Reference

Reference: https://nextjs.org/docs/app/api-reference/file-conventions
