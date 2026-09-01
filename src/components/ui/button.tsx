"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/35 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        // Ink does the filling; violet only ever outlines.
        default: "bg-ink text-white hover:bg-ink/90",
        ghost: "bg-transparent text-ink hover:bg-wash",
        outline: "border border-ink/15 bg-transparent text-ink hover:border-ink/35",
        accent:
          "border-[1.5px] border-violet bg-transparent text-violet hover:border-violet-deep hover:text-violet-deep",
        soft: "bg-wash text-violet-deep hover:bg-hairline-strong",
        success: "bg-grass text-white hover:brightness-110",
        destructive: "bg-rose-soft text-rose hover:brightness-97",
      },
      size: {
        default: "h-9 px-5 text-[14px]",
        sm: "h-8 px-4 text-[13px]",
        lg: "h-11 px-7 text-[15px]",
        icon: "h-9 w-9",
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
