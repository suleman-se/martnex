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

      {/* Auth Card: Architectural Monolith Style */}
      <div className="w-full bg-card rounded-lg p-10 md:p-12 shadow-premium border border-white/40">
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

      {/* Decorative Subtle Background Detail (Handled by Layout/Global but localized here for effect) */}
      <div className="fixed top-0 right-0 -z-10 w-1/3 h-full opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
      </div>
      <div className="fixed bottom-0 left-0 -z-10 w-1/3 h-full opacity-30 pointer-events-none overflow-hidden">
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};
