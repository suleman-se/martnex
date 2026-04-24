'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Overview', href: '/seller', icon: LayoutDashboard },
  { name: 'Products', href: '/seller/products', icon: Package },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingBag },
  { name: 'Settings', href: '/seller/settings', icon: Settings },
];

interface SellerSidebarProps {
  isOpen: boolean;
  isVerified: boolean;
}

export function SellerSidebar({ isOpen, isVerified }: SellerSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-white shadow-xl shadow-slate-200/50 border-r border-slate-100 ${
        isOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0 hidden'
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
            const isActive = pathname === item.href;
            const disabled = !isVerified && item.href !== '/seller' && item.href !== '/seller/settings';
            
            return (
              <Link
                key={item.name}
                href={disabled ? '#' : item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-slate-900 text-white font-bold shadow-md' 
                    : disabled 
                      ? 'text-slate-300 cursor-not-allowed grayscale'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`}
                onClick={(e) => disabled && e.preventDefault()}
              >
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : disabled ? 'text-slate-200' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="font-medium tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 mt-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all font-medium group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-500" />
            <span className="tracking-tight">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
