"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reactor-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-reactor-cyan text-[#0a0a0f] font-semibold hover:bg-[#00d4e0] shadow-reactor-cyan hover:shadow-[0_0_30px_rgba(0,245,255,0.5)] hover:scale-[1.02]",
        ghost:
          "text-white/70 hover:text-white hover:bg-white/5 hover:border-white/10",
        outline:
          "border border-reactor-border text-white/70 hover:text-reactor-cyan hover:border-reactor-cyan/50 hover:bg-reactor-cyan/5 bg-transparent",
        destructive:
          "bg-reactor-red/20 text-reactor-red border border-reactor-red/30 hover:bg-reactor-red/30 hover:border-reactor-red/60",
        secondary:
          "bg-reactor-surface text-white/70 hover:text-white hover:bg-reactor-card border border-reactor-border",
        success:
          "bg-reactor-green/20 text-reactor-green border border-reactor-green/30 hover:bg-reactor-green/30 hover:border-reactor-green/60",
        purple:
          "bg-reactor-purple/20 text-reactor-purple border border-reactor-purple/30 hover:bg-reactor-purple/30 hover:border-reactor-purple/60",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-6 text-base",
        xl: "h-14 rounded-xl px-8 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
