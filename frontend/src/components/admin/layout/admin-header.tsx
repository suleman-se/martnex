'use client';

import { Menu, Search, Bell, Settings } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
         <Button
           onClick={onToggle}
           variant="ghost"
           size="icon"
           className="h-9 w-9 rounded-lg hover:bg-secondary"
         >
           <Menu className="w-5 h-5 text-primary" />
         </Button>

        <div className="relative group hidden lg:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text" 
            placeholder="Global registry search..." 
            className="h-10 w-80 rounded-lg border-none bg-secondary/50 pl-12 pr-6 text-[11px] font-black uppercase tracking-widest placeholder:text-muted-foreground/60 focus-visible:ring-primary/10"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-muted-foreground">
           <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-primary">
              <Bell className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-primary">
              <Settings className="w-5 h-5" />
           </Button>
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-border/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-primary leading-none tracking-tight">{user.first_name} {user.last_name}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Registry Supervisor</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary/10">
            ADMIN
          </div>
        </div>
      </div>
    </header>
  );
}
