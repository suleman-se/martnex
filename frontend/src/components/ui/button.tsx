import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/10 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.95] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white shadow-premium hover:bg-slate-800 active:scale-95",
        premium:
          "bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white " +
          "border border-slate-950/10 shadow-lg shadow-slate-900/10 " +
          "hover:shadow-xl hover:shadow-slate-900/15 hover:-translate-y-0.5 active:scale-[0.98] " +
          "transition-all duration-300 ease-out font-black tracking-wider",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm",
        outline:
          "border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900 " +
          "dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-muted active:scale-95",
        tonal:
          "bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95 " +
          "dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
        ghost:
          "hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors " +
          "dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        link: "text-primary underline-offset-4 hover:underline font-bold",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-10 text-base",
        xl: "h-16 rounded-2xl px-12 text-lg font-black",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
