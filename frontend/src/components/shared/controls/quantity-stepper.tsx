import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuantityStepperProps {
  value: number
  onDecrease: () => void
  onIncrease: () => void
  disableDecrease?: boolean
  disableIncrease?: boolean
  className?: string
  valueClassName?: string
}

export function QuantityStepper({
  value,
  onDecrease,
  onIncrease,
  disableDecrease = false,
  disableIncrease = false,
  className,
  valueClassName,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-2 py-1',
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onDecrease}
        disabled={disableDecrease}
        className="h-5 w-5 p-0 text-base font-black text-slate-500 hover:bg-transparent hover:text-slate-900"
      >
        −
      </Button>
      <span className={cn('w-5 text-center text-xs font-black text-slate-900', valueClassName)}>
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onIncrease}
        disabled={disableIncrease}
        className="h-5 w-5 p-0 text-base font-black text-slate-500 hover:bg-transparent hover:text-slate-900"
      >
        +
      </Button>
    </div>
  )
}
