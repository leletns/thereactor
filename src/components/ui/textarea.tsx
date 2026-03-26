import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-reactor-border bg-reactor-surface px-3 py-2 text-sm text-white placeholder:text-white/30 transition-all duration-200 resize-none",
          "focus:outline-none focus:border-reactor-cyan/50 focus:bg-reactor-card focus:shadow-[0_0_0_1px_rgba(0,245,255,0.2)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
