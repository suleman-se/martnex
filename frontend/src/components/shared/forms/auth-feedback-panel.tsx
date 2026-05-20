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
    container: 'bg-emerald-50 text-emerald-900',
    iconWrap: 'bg-emerald-100',
    title: 'text-emerald-900',
    message: 'text-emerald-700/80',
  },
  error: {
    container: 'bg-red-50 text-red-900',
    iconWrap: 'bg-red-100',
    title: 'text-red-900',
    message: 'text-red-700/80',
  },
  warning: {
    container: 'bg-amber-50 text-amber-900',
    iconWrap: 'bg-amber-100',
    title: 'text-amber-900',
    message: 'text-amber-700/80',
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
        'animate-in fade-in zoom-in duration-500 flex flex-col items-center space-y-6 rounded-2xl p-8 text-center',
        styles.container,
        className,
      )}
    >
      <div className={cn('flex h-16 w-16 items-center justify-center rounded-4xl', styles.iconWrap)}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className={cn('text-lg font-black uppercase tracking-tight', styles.title)}>{title}</h3>
        <p className={cn('max-w-60 text-sm font-medium leading-relaxed', styles.message)}>{message}</p>
      </div>
      {action}
    </div>
  );
}