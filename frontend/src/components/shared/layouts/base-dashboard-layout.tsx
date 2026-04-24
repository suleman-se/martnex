'use client';

import { useState } from 'react';

interface BaseDashboardLayoutProps {
  /** Render prop — receives isOpen so sidebar can show/hide correctly */
  sidebar: (isOpen: boolean) => React.ReactNode;
  /** Render prop — receives isOpen & onToggle for the menu toggle button */
  header: (props: { isOpen: boolean; onToggle: () => void }) => React.ReactNode;
  /** Optional content between header and main (e.g. VerificationBanners) */
  banners?: React.ReactNode;
  children: React.ReactNode;
  /** Tailwind bg class for the full-page background. Default: bg-slate-50 */
  background?: string;
  /** Max-width constraint for inner content. Default: max-w-7xl */
  maxWidth?: string;
}

/**
 * BaseDashboardLayout
 *
 * The universal shell for all portal layouts (Seller, Admin, Buyer).
 * Owns sidebar open/close state and wires sidebar, header, banners,
 * and page content together via render props — nothing domain-specific.
 *
 * Usage:
 * ```tsx
 * <BaseDashboardLayout
 *   sidebar={(isOpen) => <AdminSidebar isOpen={isOpen} />}
 *   header={(props) => <AdminHeader {...props} />}
 * >
 *   {children}
 * </BaseDashboardLayout>
 * ```
 */
export function BaseDashboardLayout({
  sidebar,
  header,
  banners,
  children,
  background = 'bg-slate-50',
  maxWidth = 'max-w-7xl',
}: BaseDashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`min-h-screen ${background} text-slate-900 font-sans`}>
      {/* Sidebar — receives live isOpen state */}
      {sidebar(isOpen)}

      {/* Main canvas — shifts right when sidebar is open */}
      <div className={`transition-all duration-500 ${isOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Header — receives toggle callback */}
        {header({ isOpen, onToggle: () => setIsOpen((v) => !v) })}

        {/* Optional status banners */}
        {banners}

        {/* Page content */}
        <main className="p-10 relative">
          <div className={`${maxWidth} mx-auto`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
