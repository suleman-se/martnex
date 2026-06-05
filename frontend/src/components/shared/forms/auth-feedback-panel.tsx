import { cn } from '@/lib/utils';

interface AuthFeedbackPanelProps {
  variant?: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const variantClasses = {
  success: {
    container: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300',
    iconWrap: 'h-16 w-18 bg-emerald-100 dark:bg-emerald-900/40',
    title: 'text-emerald-900 dark:text-emerald-300',
    message: 'text-emerald-700/80 dark:text-emerald-400/80',
  },
  error: {
    container: 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300',
    iconWrap: 'h-16 w-16 bg-red-100 dark:bg-red-900/40',
    title: 'text-red-900 dark:text-red-300',
    message: 'text-red-700/80 dark:text-red-400/80',
  },
  warning: {
    container: 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300',
    iconWrap: 'h-16 w-18 bg-amber-100 dark:bg-amber-900/40',
    title: 'text-amber-900 dark:text-amber-300',
    message: 'text-amber-700/80 dark:text-amber-400/80',
  },
} as const;

export function AuthFeedbackPanel({
  variant = 'success',
  title,
  message,
  icon,
  action,
  className,
}: AuthFeedbackPanelProps) {
  const styles = variantClasses[variant];

  return (
    <div
      className={cn(
        'animate-in fade-in zoom-in duration-500 flex flex-col items-center space-y-6 rounded-2xl p-6 text-left',
        styles.container,
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={cn('flex items-center justify-center rounded-4xl', styles.iconWrap)}>
            {icon}
          </div>
          <div>
            <h3 className={cn('text-lg font-black uppercase tracking-tight', styles.title)}>{title}</h3>
            <p className={cn('max-w-60 text-sm font-medium leading-relaxed', styles.message)}>{message}</p>
          </div>
        </div>
      </div>
      {action}
    </div>
  );
}