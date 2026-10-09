import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChamferFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  corners?: "tr-bl" | "tl-br";
  cutSize?: number;
  border?: boolean;
  children?: React.ReactNode;
}

export function ChamferFrame({
  corners = "tr-bl",
  cutSize = 20,
  border = true,
  className,
  style,
  children,
  ...props
}: ChamferFrameProps) {
  // 60-degree cut: vertical delta = cutSize * tan(60 deg) = cutSize * sqrt(3)
  const vertDelta = Math.round(cutSize * Math.sqrt(3) * 100) / 100;

  const clipPath =
    corners === "tr-bl"
      ? `polygon(0 0, calc(100% - ${cutSize}px) 0, 100% ${vertDelta}px, 100% 100%, ${cutSize}px 100%, 0 calc(100% - ${vertDelta}px))`
      : `polygon(${cutSize}px 0, 100% 0, 100% calc(100% - ${vertDelta}px), calc(100% - ${cutSize}px) 100%, 0 100%, 0 ${vertDelta}px)`;

  return (
    <div
      className={cn(
        "relative inline-block overflow-hidden bg-surface transition-colors",
        border && "border border-border",
        className
      )}
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
