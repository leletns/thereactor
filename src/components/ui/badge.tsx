import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-reactor-cyan/15 text-reactor-cyan border border-reactor-cyan/30",
        success:
          "bg-reactor-green/15 text-reactor-green border border-reactor-green/30",
        warning:
          "bg-orange-500/15 text-orange-400 border border-orange-500/30",
        danger:
          "bg-reactor-red/15 text-reactor-red border border-reactor-red/30",
        secondary:
          "bg-white/5 text-white/60 border border-white/10",
        purple:
          "bg-reactor-purple/15 text-reactor-purple border border-reactor-purple/30",
        outline:
          "border border-reactor-border text-white/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
