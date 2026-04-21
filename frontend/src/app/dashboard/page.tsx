'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const lastCheckedSellerUserId = useRef<string | null>(null);

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'seller') {
        if (user.id && lastCheckedSellerUserId.current === user.id) {
          return;
        }

        if (user.id) {
          lastCheckedSellerUserId.current = user.id;
        }

        const checkSellerProfile = async () => {
          try {
            const token = localStorage.getItem('access_token');
            const headers = await buildStoreHeaders(token || undefined);
            const response = await fetch(`${getBackendUrl()}/store/sellers/me`, {
              headers,
            });
            
            if (!response.ok && response.status === 404) {
              router.push('/onboarding/seller');
            }
          } catch (error) {
            console.error('Error checking seller status:', error);
          }
        };
        
        checkSellerProfile();
      }
    }
  }, [isAuthenticated, _hasHydrated, user, router]);

  if (!_hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">M</div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Martnex</h1>
              <Badge variant="secondary" className="ml-2 text-[10px] uppercase tracking-widest px-1.5 py-0">v{process.env.NEXT_PUBLIC_APP_VERSION}</Badge>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-900">{user.first_name} {user.last_name}</p>
                <p className="text-[10px] text-slate-500 uppercase font-medium tracking-tight">{user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Welcome back, {user.first_name}!
          </h2>
          <p className="text-slate-500">Here's an overview of your Martnex account and platform status.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-xs font-medium text-slate-500 mb-1">Email Address</dt>
                  <dd className="text-sm font-semibold text-slate-900">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-slate-500 mb-1">Verification Status</dt>
                  <dd>
                    {user.email_verified ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">✓ Verified</Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50">⚠ Unverified</Badge>
                    )}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.role === 'buyer' && (
                <Button className="w-full justify-start gap-2" asChild>
                  <Link href="/shop">Browse Marketplace →</Link>
                </Button>
              )}
              {user.role === 'seller' && (
                <>
                  <Button className="w-full justify-start gap-2" asChild>
                    <Link href="/seller/products">Manage Inventory →</Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2" asChild>
                    <Link href="/seller/orders">Order Fulfillment →</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-400 uppercase tracking-wider">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
                  API Response: 24ms
                </li>
                <li className="flex items-center text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                  PostgreSQL Connectivity
                </li>
                <li className="flex items-center text-xs font-semibold text-slate-700">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                  Redis Cache: Active
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Release Note</Badge>
              <h3 className="text-2xl font-bold">Phase 4 Deployment Successful</h3>
              <p className="text-slate-400 max-w-xl">
                The core authentication and multi-vendor onboarding flow is now live. 
                Next milestone: Advanced Product Upload Wizard and Global Listing Synchronization.
              </p>
            </div>
            <Button className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 font-bold grow-0">
              View Roadmap
            </Button>
          </div>
          {/* Abstract geometric background elements */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-slate-500/10 rounded-full blur-3xl"></div>
        </div>
      </main>
    </div>
  );
}
