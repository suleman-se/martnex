'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/shared/guards/protected-route';
import { AdminSidebar } from '@/components/admin/layout/admin-sidebar';
import { AdminHeader } from '@/components/admin/layout/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-surface text-primary font-sans">
        <AdminSidebar isOpen={isSidebarOpen} />

        <div className={`transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
          <AdminHeader 
            isOpen={isSidebarOpen} 
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          />

          <main className="p-10 relative bg-surface">
            <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-140px)]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
