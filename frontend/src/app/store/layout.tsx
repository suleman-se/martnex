import type { ReactNode } from 'react'
import { StoreHeader } from '@/components/store/layout/store-header'
import { CartDrawer } from '@/components/store/layout/cart-drawer'
import { NewsletterBlock } from '@/components/store/layout/newsletter-block'
import { FooterCategories } from '@/components/store/layout/footer-categories'
import Link from 'next/link'
import { Globe, ShieldCheck } from 'lucide-react'

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StoreHeader />
      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">{children}</main>
      <CartDrawer />

      <footer className="border-t border-slate-100 bg-white">
        {/* Top Sitemap section */}
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/store" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 bg-slate-900 rounded-xl flex items-center justify-center text-white font-extrabold text-sm transition-transform group-hover:rotate-3 duration-300">
                M
              </div>
              <span className="font-heading font-black text-slate-900 text-lg">
                Martnex
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              The next-generation multi-vendor marketplace platform built on Medusa v2 and Next.js. Connecting premium independent sellers with global buyers.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" /> Secure checkout enabled
            </div>
          </div>

          {/* Sitemap Columns */}
          <FooterCategories />

          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Partner Portals</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><Link href="/seller" className="hover:text-slate-900 transition-colors">Merchant Portal</Link></li>
              <li><Link href="/seller/onboarding" className="hover:text-slate-900 transition-colors">Apply as Seller</Link></li>
              <li><Link href="/admin" className="hover:text-slate-900 transition-colors">Platform Admin Hub</Link></li>
              <li><Link href="/store" className="hover:text-slate-900 transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>

          {/* Newsletter block */}
          <NewsletterBlock />
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-100 bg-slate-50/50 pb-16 lg:pb-0">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                Martnex · Multi-Vendor Marketplace
              </p>
              <span className="hidden sm:inline h-1.5 w-1.5 rounded-full bg-slate-200" />
              <p className="text-[10px] font-medium text-slate-400">
                Powered by Medusa v2
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-slate-400 text-center">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                <Globe className="h-3.5 w-3.5" /> USD ($)
              </div>
              <span className="hidden sm:inline h-3 w-px bg-slate-200" />
              <p className="text-[10px] font-medium">
                &copy; {new Date().getFullYear()} Martnex Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
