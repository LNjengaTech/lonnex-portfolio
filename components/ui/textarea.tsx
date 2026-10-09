import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  chamfer?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, chamfer = true, style, ...props }, ref) => {
    const clipPath = chamfer
      ? "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)"
      : undefined;

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-none border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
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
Textarea.displayName = "Textarea";

export { Textarea };
