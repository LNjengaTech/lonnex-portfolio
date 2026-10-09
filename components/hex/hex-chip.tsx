import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const hexChipVariants = cva(
  "inline-flex items-center gap-1.5 font-mono text-xs uppercase transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-surface text-foreground border border-border hover:border-primary",
        active: "bg-primary text-primary-foreground border-transparent",
        muted: "bg-background text-muted-foreground border border-border",
      },
      size: {
        sm: "h-6 px-3 text-[10px] tracking-wider",
        default: "h-7 px-4 text-xs tracking-widest",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface HexChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof hexChipVariants> {
  icon?: React.ReactNode;
}

export function HexChip({
  className,
  variant,
  size,
  icon,
  children,
  style,
  ...props
}: HexChipProps) {
  // Hex-capped ends: 8px inset
  const clipPath =
    "polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)";

  return (
    <div
      className={cn(hexChipVariants({ variant, size, className }))}
      style={{
        clipPath,
        ...style,
      }}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
