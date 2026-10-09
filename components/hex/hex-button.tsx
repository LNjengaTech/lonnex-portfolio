import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const hexButtonVariants = cva(
  "inline-flex items-center justify-center font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
        secondary: "bg-surface text-foreground hover:bg-background active:scale-95 border border-border",
        outline: "bg-transparent text-foreground hover:bg-surface active:scale-95 border border-border",
        invert: "bg-invert text-invert-foreground hover:opacity-90 active:scale-95",
      },
      size: {
        sm: "h-8 px-5 text-xs",
        default: "h-10 px-7 text-xs tracking-widest",
        lg: "h-12 px-9 text-sm tracking-[0.2em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface HexButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof hexButtonVariants> {}

export const HexButton = React.forwardRef<HTMLButtonElement, HexButtonProps>(
  ({ className, variant, size, style, children, ...props }, ref) => {
    // 60-degree hex caps: left point at (0, 50%), right point at (100%, 50%)
    // Cap depth inset = 12px for balanced hex angles
    const clipPath =
      "polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)";

    return (
      <button
        ref={ref}
        className={cn(hexButtonVariants({ variant, size, className }))}
        style={{
          clipPath,
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
HexButton.displayName = "HexButton";
