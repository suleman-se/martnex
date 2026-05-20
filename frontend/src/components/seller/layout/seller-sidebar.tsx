'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Banknote,
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Overview',  href: '/seller',          icon: LayoutDashboard },
  { name: 'Products',  href: '/seller/products',  icon: Package },
  { name: 'Orders',    href: '/seller/orders',    icon: ShoppingBag },
  { name: 'Payouts',   href: '/seller/payouts',   icon: Banknote },
  { name: 'Settings',  href: '/seller/settings',  icon: Settings },
];

interface SellerSidebarProps {
  isOpen: boolean;
}

export function SellerSidebar({ isOpen }: SellerSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-slate-100 bg-white shadow-xl shadow-slate-200/50 transition-all duration-500 ${
        isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col h-full p-6">
        <div className="flex items-center gap-3 px-2 py-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/20">
            <span className="font-heading font-black text-white text-2xl">M</span>
          </div>
          <span className="text-xl font-heading font-black tracking-tight text-slate-900">
            Martnex Seller
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-0 mt-10">
          {navigation.map((item) => {
            const isActive =
              item.href === '/seller'
                ? pathname === '/seller'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold shadow-md'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="font-medium tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 mt-6 border-t border-slate-100">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="h-auto w-full justify-start gap-3 rounded-xl px-4 py-3 font-medium text-slate-400 hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-500" />
            <span className="tracking-tight">Logout</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
