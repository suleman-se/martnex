'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { FullPageSpinner } from '@/components/shared/loading/full-page-spinner';

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
    return <FullPageSpinner />;
  }

  // Authenticated users see loading while redirect happens (except for verify-email bypass)
  const isBypassingRedirect = pathname === '/verify-email' && isAuthenticated && !user?.email_verified;
  if (isAuthenticated && !isBypassingRedirect) {
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh font-sans p-6 lg:p-8 animate-in fade-in duration-700">
      <div className="w-full max-w-md space-y-8">
        {children}
      </div>
    </div>
  );
}
