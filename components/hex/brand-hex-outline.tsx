import * as React from "react";
import { cn } from "@/lib/utils";

export interface BrandHexOutlineProps
  extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  strokeWidth?: number;
}

export function BrandHexOutline({
  size = 24,
  strokeWidth = 6,
  className,
  ...props
}: BrandHexOutlineProps) {
  const height = size;
  const width = Math.round(size * 0.866025 * 100) / 100;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 115.47"
      fill="none"
      stroke="currentColor"
      className={cn("inline-block flex-shrink-0", className)}
      {...props}
    >
      <polygon
        points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
