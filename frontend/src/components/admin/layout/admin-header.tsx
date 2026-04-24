'use client';

import { Menu, Search, Bell, Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';

interface AdminHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AdminHeader({ isOpen, onToggle }: AdminHeaderProps) {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border/5 py-4 px-10 flex justify-between items-center h-16">
      <div className="flex items-center gap-10">
         <button 
           onClick={onToggle} 
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
  );
}
