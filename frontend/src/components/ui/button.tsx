import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/10 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.95] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-premium hover:opacity-90 active:scale-95",
        premium: "bg-gradient-to-br from-[#000000] to-[#333b50] text-white shadow-premium hover:shadow-2xl hover:-translate-y-0.5 active:scale-95",
        destructive: "bg-destructive text-destructive-foreground hover:opacity-90 shadow-sm",
        outline: "border border-border/60 bg-transparent hover:bg-white text-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted active:scale-95",
        tonal: "bg-[#e0e3e5] text-primary hover:bg-[#e6e8ea] active:scale-95",
        ghost: "hover:bg-accent/40 text-muted-foreground hover:text-primary transition-colors",
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
