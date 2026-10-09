import * as React from "react";
import { HEX_CLIP_PATH, calcHexWidth } from "@/lib/hex";
import { cn } from "@/lib/utils";

export interface SkeletonHexProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number;
  width?: number;
}

export function SkeletonHex({
  height = 96,
  width,
  className,
  style,
  ...props
}: SkeletonHexProps) {
  const actualWidth = width ?? calcHexWidth(height);

  return (
    <div
      className={cn(
        "relative inline-block animate-pulse bg-border transition-colors",
        className
      )}
      style={{
        width: `${actualWidth}px`,
        height: `${height}px`,
        clipPath: HEX_CLIP_PATH,
        ...style,
      }}
      {...props}
    />
  );
}
