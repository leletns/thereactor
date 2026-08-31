"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-sans font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // The single filled action colour — at most one per view.
        default: "bg-violet text-white hover:bg-violet-deep shadow-[0_1px_2px_rgba(2,20,34,0.08)]",
        outline:
          "border border-ink/25 bg-transparent text-ink hover:bg-ink/[0.04] hover:border-ink/40",
        ghost: "bg-transparent text-ink-2 hover:bg-ink/[0.05] hover:text-ink",
        soft: "bg-violet-soft text-violet hover:bg-violet/15",
        success: "bg-grass text-white hover:brightness-110",
        destructive: "bg-rose-soft text-rose hover:bg-rose/15",
        subtle:
          "border border-hairline bg-surface text-ink-2 hover:text-ink hover:border-hairline-strong",
      },
      size: {
        default: "h-10 px-5 text-sm",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
