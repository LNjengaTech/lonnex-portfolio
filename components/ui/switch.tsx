"use client";

import * as React from "react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  checked = false,
  onCheckedChange,
  className,
  disabled = false,
  ...props
}: SwitchProps) {
  const [isChecked, setIsChecked] = React.useState(checked);

  React.useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    setIsChecked(next);
    onCheckedChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={toggle}
      className={cn(
        "relative inline-flex h-6 w-12 shrink-0 cursor-pointer items-center border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-primary border-primary" : "bg-surface",
        className
      )}
      {...props}
    >
      {/* Hex Thumb */}
      <span
        className={cn(
          "pointer-events-none block h-4 w-3.5 transition-transform duration-200",
          isChecked
            ? "translate-x-6 bg-primary-foreground"
            : "translate-x-1 bg-muted-foreground"
        )}
        style={{ clipPath: HEX_CLIP_PATH }}
      />
    </button>
  );
}
