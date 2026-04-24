'use client';

import { ProtectedRoute } from '@/components/shared/guards/protected-route';
import { BaseDashboardLayout } from '@/components/shared/layouts/base-dashboard-layout';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';
import { AdminHeader } from '@/components/admin/layout/admin-header';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <BaseDashboardLayout
        sidebar={(isOpen) => <AdminSidebar isOpen={isOpen} />}
        header={(props) => <AdminHeader {...props} />}
        background="bg-surface"
        maxWidth="max-w-[1600px]"
      >
        {children}
      </BaseDashboardLayout>
    </ProtectedRoute>
  );
}
