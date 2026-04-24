import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** Controls the visual prominence. 'default' is subtle/dimmed. */
  variant?: 'default' | 'card';
}

/**
 * EmptyState
 *
 * Universal empty/idle state component for tables, panels, and full pages.
 * Consistent across all domains — no ad-hoc inline empty states.
 *
 * ```tsx
 * <EmptyState
 *   icon={PackageX}
 *   title="No Products Yet"
 *   description="Add your first product to start selling."
 *   action={<Button>Add Product</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center space-y-6 opacity-40',
        variant === 'card' && 'bg-card border border-border/10 rounded-2xl p-12 shadow-premium opacity-100',
        className,
      )}
    >
      <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary/60 flex items-center justify-center">
        <Icon className="w-9 h-9 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="text-lg font-black text-primary uppercase tracking-tight">{title}</p>
        {description && (
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
