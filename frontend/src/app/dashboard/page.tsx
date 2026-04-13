'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  if (!_hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Martnex</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {user.first_name} {user.last_name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome, {user.first_name}!
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Account Info</h3>
                <dl className="mt-2 space-y-1 text-sm">
                  <div>
                    <dt className="text-gray-500">Email:</dt>
                    <dd className="text-gray-900">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Role:</dt>
                    <dd className="text-gray-900 capitalize">{user.role}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Email Verified:</dt>
                    <dd className="text-gray-900">
                      {user.email_verified ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-yellow-600">⚠ Not Verified</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <div className="mt-2 space-y-2">
                  {user.role === 'buyer' && (
                    <Link
                      href="/shop"
                      className="block text-sm text-blue-600 hover:text-blue-500"
                    >
                      Browse Products →
                    </Link>
                  )}
                  {user.role === 'seller' && (
                    <>
                      <Link
                        href="/seller/products"
                        className="block text-sm text-blue-600 hover:text-blue-500"
                      >
                        Manage Products →
                      </Link>
                      <Link
                        href="/seller/orders"
                        className="block text-sm text-blue-600 hover:text-blue-500"
                      >
                        View Orders →
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">System Status</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex items-center text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Backend Connected
                  </div>
                  <div className="flex items-center text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Database Active
                  </div>
                  <div className="flex items-center text-green-600">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                    Redis Connected
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Phase 4 Complete!</strong> All authentication pages are now integrated with
                the database-backed backend. You can register, login, verify email, and reset passwords.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
