'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-900 border-t-transparent"></div>
  </div>
);

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, user, _hasHydrated, refreshUser } = useAuthStore();
  const router = useRouter();
  // Use mounted state to guarantee SSR and client initial render are identical
  const [mounted, setMounted] = useState(false);
  // isValidating: true until we've confirmed the token is live with the server
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Once hydrated, validate the token against the server.
  // refreshUser() calls logout() internally on 401/403/missing token,
  // which flips isAuthenticated → false and clears the cookie.
  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    if (!isAuthenticated) {
      // Not logged in at all — skip network call
      setIsValidating(false);
      return;
    }

    let cancelled = false;
    refreshUser().finally(() => {
      if (!cancelled) setIsValidating(false);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, _hasHydrated]);

  // After validation settles, decide whether to grant access or redirect
  useEffect(() => {
    if (!mounted || !_hasHydrated || isValidating) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
      router.push(redirectTo);
      return;
    }

    setIsAuthorized(true);
  }, [mounted, _hasHydrated, isValidating, isAuthenticated, user, allowedRoles, router, redirectTo]);

  // Both SSR and initial CSR render return loading — no mismatch
  if (!mounted || !_hasHydrated || isValidating || !isAuthorized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
