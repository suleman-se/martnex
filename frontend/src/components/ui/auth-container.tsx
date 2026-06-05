import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from './badge';

interface AuthContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  badgeText?: string;
  className?: string;
}

export const AuthContainer = ({
  children,
  title,
  description,
  badgeText,
  className,
}: AuthContainerProps) => {
  return (
    <div className={cn("w-full max-w-[440px] flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700", className)}>
      {/* Brand Identity: M Logo Square */}
      <div className="mb-10">
        <div className="w-14 h-14 bg-primary text-on-primary-container flex items-center justify-center rounded-lg shadow-xl shadow-primary/5">
          <span className="text-3xl font-black tracking-tighter text-white">M</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="w-full bg-card rounded-2xl p-10 md:p-12 shadow-premium border border-slate-200/60 dark:border-slate-700/40">
        <div className="mb-10 text-center">
          <h1 className="text-[32px] font-bold tracking-tight text-primary leading-tight mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm font-medium">
              {description}
            </p>
          )}
        </div>

        {children}
      </div>

    </div>
  );
};
