'use client';

import { ProtectedRoute } from '@/components/shared/guards/protected-route';
import { BaseDashboardLayout } from '@/components/shared/layouts/base-dashboard-layout';
import { useSellerProfile } from '@/hooks/use-seller-profile';
import { SellerSidebar } from '@/components/seller/layout/seller-sidebar';
import { SellerHeader } from '@/components/seller/layout/seller-header';
import { VerificationBanners } from '@/components/seller/layout/verification-banners';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { FullPageSpinner } from '@/components/shared/loading/full-page-spinner';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isVerified, isPending, isRejected, isSuspended, hasProfile } = useSellerProfile();
  const router = useRouter();
  const pathname = usePathname();

  const isOnboardingPage = pathname === '/seller/onboarding';

  useEffect(() => {
    if (isLoading) return;
    if (!hasProfile && !isOnboardingPage) {
      // No profile yet — send to onboarding
      router.push('/seller/onboarding');
    } else if (hasProfile && isOnboardingPage) {
      // Already has a profile — onboarding is done, go to dashboard
      router.push('/seller');
    }
  }, [isLoading, hasProfile, isOnboardingPage, router]);

  // ProtectedRoute ALWAYS renders — it validates the token against the server.
  // If the token is stale/deleted-user, ProtectedRoute calls logout() and
  // redirects to /login before the profile check can send the user to /onboarding.
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      {isOnboardingPage ? (
        // Render the onboarding page without the dashboard shell.
        // It has its own ProtectedRoute inside which is fine.
        children
      ) : isLoading || !hasProfile ? (
        <FullPageSpinner spinnerClassName="h-10 w-10 border-slate-900 border-t-transparent" />
      ) : (
        <BaseDashboardLayout
          sidebar={(isOpen) => <SellerSidebar isOpen={isOpen} />}
          header={(props) => (
            <SellerHeader
              {...props}
              isVerified={isVerified}
              isRejected={isRejected}
              isSuspended={isSuspended}
            />
          )}
          banners={
            <VerificationBanners
              isPending={isPending}
              isRejected={isRejected}
              isSuspended={isSuspended}
            />
          }
        >
          {children}
        </BaseDashboardLayout>
      )}
    </ProtectedRoute>
  );
}
