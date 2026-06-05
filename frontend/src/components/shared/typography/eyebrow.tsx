import { cn } from '@/lib/utils'

interface EyebrowProps {
  children: React.ReactNode
  className?: string
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p className={cn('text-xs font-black uppercase tracking-widest text-slate-400', className)}>
      {children}
    </p>
  )
}
