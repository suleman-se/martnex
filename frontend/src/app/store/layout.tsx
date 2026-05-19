import type { ReactNode } from 'react'
import { StoreHeader } from '@/components/store/layout/store-header'

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <StoreHeader />
      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
      <footer className="border-t border-slate-100 bg-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Martnex · Multi-Vendor Marketplace
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            Powered by Medusa v2
          </p>
        </div>
      </footer>
    </div>
  )
}
