'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  // Use mounted state to guarantee SSR and client initial render are identical
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;

    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
      router.push(redirectTo);
      return;
    }

    setIsAuthorized(true);
  }, [mounted, _hasHydrated, isAuthenticated, user, allowedRoles, router, redirectTo]);

  // Both SSR and initial CSR render return loading — no mismatch
  if (!mounted || !_hasHydrated || !isAuthorized) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
