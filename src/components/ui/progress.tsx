"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    color?: "cyan" | "green" | "purple" | "orange" | "red";
  }
>(({ className, value, color = "cyan", ...props }, ref) => {
  const colorMap = {
    cyan: "bg-reactor-cyan shadow-[0_0_10px_rgba(0,245,255,0.5)]",
    green: "bg-reactor-green shadow-[0_0_10px_rgba(0,255,136,0.5)]",
    purple: "bg-reactor-purple shadow-[0_0_10px_rgba(139,92,246,0.5)]",
    orange: "bg-reactor-orange shadow-[0_0_10px_rgba(255,107,53,0.5)]",
    red: "bg-reactor-red shadow-[0_0_10px_rgba(255,68,68,0.5)]",
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-reactor-border",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500 ease-out rounded-full",
          colorMap[color]
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
