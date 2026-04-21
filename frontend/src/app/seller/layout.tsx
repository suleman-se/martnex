'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { buildStoreHeaders, getBackendUrl } from '@/lib/medusa-client';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Overview', href: '/seller', icon: LayoutDashboard },
  { name: 'Products', href: '/seller/products', icon: Package },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingBag },
  { name: 'Settings', href: '/seller/settings', icon: Settings },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [seller, setSeller] = useState<any>(null);
  const [isLoadingSeller, setIsLoadingSeller] = useState(true);

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated || user?.role !== 'seller') {
        router.push('/login');
      } else {
        const fetchSeller = async () => {
          try {
            const token = localStorage.getItem('access_token');
            const headers = await buildStoreHeaders(token || undefined);
            const response = await fetch(`${getBackendUrl()}/store/sellers/me`, {
              headers,
            });
            
            if (response.ok) {
              const data = await response.json();
              const sellerData = data.seller;
              setSeller(sellerData);

              // Route Protection: Redirect if trying to access protected routes while unverified
              const isVerified = sellerData?.verification_status === 'verified';
              const protectedRoutes = ['/seller/products', '/seller/orders'];
              
              if (!isVerified && protectedRoutes.some(route => pathname.startsWith(route))) {
                router.replace('/seller');
              }
            } else if (response.status === 404) {
              // Redirect to onboarding if profile doesn't exist
              router.push('/onboarding/seller');
            }
          } catch (error) {
            console.error('Error fetching seller:', error);
          } finally {
            setIsLoadingSeller(false);
          }
        };

        fetchSeller();
      }
    }
  }, [_hasHydrated, isAuthenticated, user, router, pathname]);

  if (!_hasHydrated || !isAuthenticated || user?.role !== 'seller' || isLoadingSeller) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-900 border-t-transparent"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isVerified = seller?.verification_status === 'verified';
  const isRejected = seller?.verification_status === 'rejected';
  const isSuspended = seller?.verification_status === 'suspended';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-white shadow-xl shadow-slate-200/50 border-r border-slate-100 ${
          isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-0 hidden'
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

      {/* Main Content */}
      <div className={`transition-all duration-500 ${isSidebarOpen ? 'ml-72' : 'ml-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-5 px-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
              >
                {!isSidebarOpen ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
              </button>
              <div className="relative group hidden lg:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search resources..." 
                  className="bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-2.5 w-80 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all">
                <Bell className="w-5 h-5" />
                {!isVerified && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>}
              </button>
              <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-none">{user.first_name} {user.last_name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    {isVerified ? 'Verified Partner' : isRejected ? 'Rejected Registry' : isSuspended ? 'Suspended Account' : 'Registry Pending'}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center font-heading font-black text-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
                  {user.first_name[0]}{user.last_name[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Global Status Banner Area */}
        <div className="px-10 mt-6">
          {/* Pending Banner */}
          {seller?.verification_status === 'pending' && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Profile Under Review</h4>
                  <p className="text-xs font-medium text-amber-700 leading-relaxed max-w-lg">
                    Welcome to the network! Your seller application is currently being processed by the Martnex Registry. 
                    Listing capabilities will be enabled upon successful verification (estimate 24h).
                  </p>
                </div>
              </div>
              <Button variant="outline" className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl px-6 font-bold text-xs gap-2 shrink-0">
                Check Guidelines <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Rejected Banner */}
          {isRejected && (
            <div className="p-5 bg-red-50 border border-red-200 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                  <X className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Application Rejected</h4>
                  <p className="text-xs font-medium text-red-700 leading-relaxed max-w-lg">
                    Unfortunately, your merchant profile did not meet our verification criteria at this time. 
                    Please contact support or review our compliance documentation to resolve this.
                  </p>
                </div>
              </div>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700 rounded-xl px-6 font-bold text-xs gap-2 shrink-0">
                Contact Support
              </Button>
            </div>
          )}

          {/* Suspended Banner */}
          {isSuspended && (
            <div className="p-5 bg-slate-900 border border-slate-700 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 animate-pulse">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div className="space-y-1 text-white">
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Security Suspension</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-lg">
                    This account's listing capabilities have been temporarily suspended due to a compliance breach or security investigation.
                  </p>
                </div>
              </div>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl px-6 font-bold text-xs gap-2 shrink-0">
                Appeal Decision
              </Button>
            </div>
          )}
        </div>

        {/* Dashboard Content */}
        <main className="p-10 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
