import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  return (
    <main className="min-h-screen bg-mesh flex flex-col items-center justify-center p-6 lg:p-12 animate-in fade-in duration-1000">
      <div className="z-10 max-w-4xl w-full flex flex-col items-center space-y-16">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="h-20 w-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white font-extrabold text-4xl shadow-premium rotate-3 hover:rotate-0 transition-transform duration-500">
            M
          </div>
          
          <div className="space-y-4">
            <Badge variant="secondary" className="px-4 py-1 bg-slate-100 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 rounded-full border-none">
              v{process.env.NEXT_PUBLIC_APP_VERSION} • Enterprise Core
            </Badge>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-slate-900 leading-[0.9]">
              Martnex
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
              The high-performance registry for distributed <span className="text-slate-900 font-bold">multi-vendor</span> commerce.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
            <Button size="xl" variant="premium" className="w-full sm:flex-1" asChild>
              <Link href="/register">Initialize Account</Link>
            </Button>
            <Button size="xl" variant="outline" className="w-full sm:flex-1 bg-white shadow-premium" asChild>
              <Link href="/login">Authentication</Link>
            </Button>
          </div>
        </div>

        {/* Feature Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {[
            { title: 'Marketplace', desc: 'Secure settlement for global product distribution.', badge: 'Consumer' },
            { title: 'Merchant Portal', desc: 'Sovereign management for multi-tenant storefronts.', badge: 'Vendor' },
            { title: 'Governance', desc: 'Registry oversight and protocol compliance.', badge: 'Admin' },
          ].map((feature, i) => (
            <div 
              key={feature.title} 
              className="p-8 bg-white/50 backdrop-blur-sm rounded-[2.5rem] border-none shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
            >
              <Badge variant="secondary" className="mb-4 bg-slate-900/5 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                {feature.badge}
              </Badge>
              <h2 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h2>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Metadata Footer */}
        <div className="pt-12 text-center space-y-6">
          <div className="h-px w-24 bg-slate-200 mx-auto"></div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
            Distributed Economy Protocol • Powered by Medusa v2
          </p>
        </div>
      </div>
    </main>
  );
}
