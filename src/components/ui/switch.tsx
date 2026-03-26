"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-reactor-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=unchecked]:bg-reactor-border",
      "data-[state=checked]:bg-reactor-cyan data-[state=checked]:shadow-[0_0_12px_rgba(0,245,255,0.4)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform duration-200",
        "data-[state=unchecked]:translate-x-0 data-[state=unchecked]:bg-white/30",
        "data-[state=checked]:translate-x-5 data-[state=checked]:bg-[#0a0a0f]"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
