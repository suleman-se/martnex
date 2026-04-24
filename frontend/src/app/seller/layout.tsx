'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/shared/guards/protected-route';
import { useSellerProfile } from '@/hooks/use-seller-profile';
import { SellerSidebar } from '@/components/seller/layout/seller-sidebar';
import { SellerHeader } from '@/components/seller/layout/seller-header';
import { VerificationBanners } from '@/components/seller/layout/verification-banners';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { isLoading, isVerified, isPending, isRejected, isSuspended, hasProfile } = useSellerProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!hasProfile) {
        router.push('/seller/onboarding');
      } else if (!isVerified) {
        const protectedRoutes = ['/seller/products', '/seller/orders'];
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
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

  // Prevent flashing content if they are being redirected to onboarding
  if (!hasProfile) {
    return null; 
  }

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <SellerSidebar 
          isOpen={isSidebarOpen} 
          isVerified={isVerified} 
        />
        
        <div className={`transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
          <SellerHeader 
            isOpen={isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            isVerified={isVerified}
            isRejected={isRejected}
            isSuspended={isSuspended}
          />
          
          <VerificationBanners 
            isPending={isPending}
            isRejected={isRejected}
            isSuspended={isSuspended}
          />

          <main className="p-10 relative">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
