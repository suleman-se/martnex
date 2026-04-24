'use client';

import { Menu, X, Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

interface SellerHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  isVerified: boolean;
  isRejected: boolean;
  isSuspended: boolean;
}

export function SellerHeader({ 
  isOpen, 
  onToggle, 
  isVerified, 
  isRejected, 
  isSuspended 
}: SellerHeaderProps) {
  const { user } = useAuthStore();

  if (!user) return null;

  const statusText = isVerified 
    ? 'Verified Partner' 
    : isRejected 
      ? 'Rejected Registry' 
      : isSuspended 
        ? 'Suspended Account' 
        : 'Registry Pending';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 py-5 px-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <button 
            onClick={onToggle}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
          >
            {!isOpen ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
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
                {statusText}
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center font-heading font-black text-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
              {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
