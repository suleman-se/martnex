'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, Store, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
  isOpen: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Shield },
  { name: 'Sellers Registry', href: '/admin/sellers', icon: Store },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ isOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-slate-900 text-white shadow-2xl ${
        isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0 hidden'
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
            const isActive = pathname === item.href;
            
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
  );
}
