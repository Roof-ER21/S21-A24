import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--s21-secondary)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#c1121f] to-[#7f1d1d] text-white shadow hover:brightness-110 active:scale-95",
        destructive:
          "bg-[var(--s21-secondary)]/10 text-[var(--s21-secondary)] border border-[var(--s21-secondary)]/30 hover:bg-[var(--s21-secondary)]/20 active:scale-95",
        outline:
          "border border-white/20 bg-transparent text-white shadow-sm hover:bg-white/10 active:scale-95",
        secondary:
          "bg-white/10 text-white shadow-sm hover:bg-white/20 active:scale-95",
        ghost: "hover:bg-white/10 text-white active:scale-95",
        link: "text-[#c1121f] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
