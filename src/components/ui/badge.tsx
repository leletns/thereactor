import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[11px] font-medium tracking-[-0.009em]",
  {
    variants: {
      variant: {
        default: "bg-wash text-violet-deep",
        neutral: "bg-sunken text-ink-2",
        success: "bg-grass-soft text-grass",
        warning: "bg-amber-soft text-amber",
        danger: "bg-rose-soft text-rose",
        outline: "border border-hairline-strong text-ink-2",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
