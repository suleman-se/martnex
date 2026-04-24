'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  // Track mounted state to prevent SSR/CSR hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !_hasHydrated) return;
    if (!isAuthenticated) return;

    // If NOT verified and on verify-email page, stay
    if (!user?.email_verified && pathname === '/verify-email') return;

    // Otherwise always redirect authenticated users away from auth routes
    router.push('/dashboard');
  }, [mounted, _hasHydrated, isAuthenticated, user, pathname, router]);

  // Consistent loading state on both server and client during hydration
  if (!mounted || !_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900/20 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  // Authenticated users see loading while redirect happens (except for verify-email bypass)
  const isBypassingRedirect = pathname === '/verify-email' && isAuthenticated && !user?.email_verified;
  if (isAuthenticated && !isBypassingRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 rounded-full border-2 border-slate-900/20 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh font-sans p-6 lg:p-8 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
}
