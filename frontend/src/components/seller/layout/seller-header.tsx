'use client';

import { Menu, X, Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
          <Button
            onClick={onToggle}
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            {!isOpen ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </Button>
          <div className="relative group hidden lg:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input
              type="text" 
              placeholder="Search resources..." 
              className="h-11 w-80 rounded-2xl border-none bg-slate-50 pl-12 pr-6 text-sm font-medium placeholder:text-slate-400 focus-visible:ring-slate-900/5"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl text-slate-500 hover:bg-slate-100">
            <Bell className="w-5 h-5" />
            {!isVerified && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-amber-500 rounded-full border-2 border-white"></span>}
          </Button>
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
