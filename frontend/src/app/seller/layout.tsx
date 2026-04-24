'use client';

import { ProtectedRoute } from '@/components/shared/guards/protected-route';
import { BaseDashboardLayout } from '@/components/shared/layouts/base-dashboard-layout';
import { useSellerProfile } from '@/hooks/use-seller-profile';
import { SellerSidebar } from '@/components/seller/layout/seller-sidebar';
import { SellerHeader } from '@/components/seller/layout/seller-header';
import { VerificationBanners } from '@/components/seller/layout/verification-banners';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isVerified, isPending, isRejected, isSuspended, hasProfile } = useSellerProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!hasProfile) {
        router.push('/seller/onboarding');
      } else if (!isVerified) {
        const protectedRoutes = ['/seller/products', '/seller/orders'];
        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
          router.replace('/seller');
        }
      }
    }
  }, [isLoading, hasProfile, isVerified, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  if (!hasProfile) return null;

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <BaseDashboardLayout
        sidebar={(isOpen) => <SellerSidebar isOpen={isOpen} isVerified={isVerified} />}
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
    </ProtectedRoute>
  );
}
