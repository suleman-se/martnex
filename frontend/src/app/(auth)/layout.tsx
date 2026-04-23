'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      // If already verified, always go to dashboard
      if (user?.email_verified || pathname !== '/verify-email') {
        router.push('/dashboard');
        return;
      }

      // If NOT verified, only redirect to dashboard if we're NOT on the verify-email page
      if (pathname !== '/verify-email') {
        router.push('/dashboard');
      }
    }
  }, [_hasHydrated, isAuthenticated, user, pathname, router]);

  // Don't show loading spinner if we're on verify-email and just need to verify
  const isBypassingRedirect = pathname === '/verify-email' && isAuthenticated && !user?.email_verified;

  if (!_hasHydrated || (isAuthenticated && !isBypassingRedirect)) {
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
