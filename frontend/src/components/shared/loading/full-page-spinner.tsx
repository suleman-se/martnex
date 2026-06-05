import { cn } from '@/lib/utils'

interface FullPageSpinnerProps {
  className?: string
  spinnerClassName?: string
}

export function FullPageSpinner({ className, spinnerClassName }: FullPageSpinnerProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-slate-50', className)}>
      <div
        className={cn(
          'w-8 h-8 rounded-full border-2 border-slate-900/20 border-t-slate-900 animate-spin',
          spinnerClassName
        )}
      />
    </div>
  )
}
