import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FieldLabelProps {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}

export function FieldLabel({ children, htmlFor, className }: FieldLabelProps) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn('text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1', className)}
    >
      {children}
    </Label>
  )
}
