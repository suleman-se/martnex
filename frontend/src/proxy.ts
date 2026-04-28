import { NextRequest, NextResponse } from 'next/server';
import type { NextProxy } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/seller', '/dashboard', '/admin'];

export const proxy: NextProxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  const isAuthenticated = request.cookies.has('martnex_auth');
  if (isAuthenticated) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
