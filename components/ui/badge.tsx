import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-mono text-[10px] uppercase font-bold tracking-widest transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-surface text-foreground border border-border",
        destructive: "bg-danger text-primary-foreground",
        outline: "bg-transparent text-foreground border border-border",
        success: "bg-success text-primary-foreground",
        warning: "bg-warning text-primary-foreground",
      },
      shape: {
        "hex-capped": "h-6 px-3.5",
        square: "h-5 px-2 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "hex-capped",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({
  className,
  variant,
  shape = "hex-capped",
  style,
  children,
  ...props
}: BadgeProps) {
  const clipPath =
    shape === "hex-capped"
      ? "polygon(6px 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0 50%)"
      : undefined;

  return (
    <div
      className={cn(badgeVariants({ variant, shape, className }))}
      style={{
        clipPath,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
