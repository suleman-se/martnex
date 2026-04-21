'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Users, Store, Settings, LogOut, Search, Bell, Menu } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, _hasHydrated, user, router]);

  if (!_hasHydrated || !isAuthenticated || user?.role !== 'admin') {
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

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Shield },
    { name: 'Sellers Registry', href: '/admin/sellers', icon: Store },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface text-primary font-sans">
      {/* Sidebar: Architectural Pillar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-slate-900 text-white shadow-2xl ${
          isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0 hidden'
        }`}
      >
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-4 px-2 py-4 mb-10">
            <div className="w-10 h-10 rounded-lg bg-white text-slate-900 flex items-center justify-center font-black text-2xl shadow-premium">
              M
            </div>
            <div>
              <span className="block text-xl font-black tracking-tighter text-white leading-none">
                Martnex
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1 block tracking-[0.2em]">Monolith</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-4 rounded-lg transition-all duration-300 group ${
                    isActive 
                      ? 'bg-slate-800 text-white font-bold' 
                      : 'text-slate-500 hover:text-white hover:bg-slate-800/30 font-medium'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                  <span className="text-sm uppercase tracking-widest font-black text-[11px]">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-8 border-t border-slate-800/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-4 rounded-lg text-slate-500 hover:text-error hover:bg-red-950/20 transition-all font-black uppercase tracking-widest text-[11px] group"
            >
              <LogOut className="w-5 h-5 group-hover:text-error" />
              <span>System Terminate</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <div className={`transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Top Bar: Transactional Header */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border/5 py-4 px-10 flex justify-between items-center h-16">
          <div className="flex items-center gap-10">
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
               className="p-2 hover:bg-secondary rounded-lg transition-colors"
             >
               <Menu className="w-5 h-5 text-primary" />
             </button>

            <div className="relative group hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Global registry search..." 
                className="bg-secondary/50 border-none rounded-lg pl-12 pr-6 py-2 w-80 text-[11px] uppercase tracking-widest font-black focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-muted-foreground">
               <button className="p-2 hover:text-primary transition-colors">
                  <Bell className="w-5 h-5" />
               </button>
               <button className="p-2 hover:text-primary transition-colors">
                  <Settings className="w-5 h-5" />
               </button>
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-border/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-primary leading-none tracking-tight">{user.first_name} {user.last_name}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 tracking-[0.15em]">Registry Supervisor</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary/10">
                ADMIN
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Viewport */}
        <main className="p-10 relative bg-surface">
          <div className="max-w-[1600px] mx-auto min-h-[calc(100vh-140px)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
