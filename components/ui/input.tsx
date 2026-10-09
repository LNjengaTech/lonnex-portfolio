import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  chamfer?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, chamfer = true, style, ...props }, ref) => {
    // Single top-right chamfered corner at 60/45 deg (8px cut)
    const clipPath = chamfer
      ? "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)"
      : undefined;

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          clipPath,
          ...style,
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
