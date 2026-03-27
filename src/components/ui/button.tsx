"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-sans text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reactor-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-reactor-cyan text-black hover:brightness-110 shadow-reactor-cyan hover:shadow-lhex-glow hover:scale-[1.02]",
        ghost:
          "text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/8",
        outline:
          "border border-reactor-border text-white/60 hover:text-reactor-cyan hover:border-reactor-cyan/40 hover:bg-reactor-cyan/5 bg-transparent",
        destructive:
          "bg-reactor-red/15 text-reactor-red border border-reactor-red/25 hover:bg-reactor-red/25",
        secondary:
          "bg-reactor-surface text-white/60 hover:text-white hover:bg-reactor-card border border-reactor-border",
        success:
          "bg-reactor-green/15 text-reactor-green border border-reactor-green/25 hover:bg-reactor-green/25",
        purple:
          "bg-reactor-purple/15 text-reactor-purple border border-reactor-purple/25 hover:bg-reactor-purple/25",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-12 px-6 text-base",
        xl:      "h-14 px-8 text-lg",
        icon:    "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
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
