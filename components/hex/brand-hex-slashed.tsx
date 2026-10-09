import * as React from "react";
import { cn } from "@/lib/utils";

export interface BrandHexSlashedProps
  extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function BrandHexSlashed({
  size = 24,
  className,
  ...props
}: BrandHexSlashedProps) {
  const height = size;
  const width = Math.round(size * 0.866025 * 100) / 100;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 115.47"
      fill="currentColor"
      className={cn("inline-block flex-shrink-0", className)}
      {...props}
    >
      {/* Top/left facet cut along 60-degree line */}
      <polygon points="50,0 100,28.87 95,37.5 15,83.7 0,75 0,28.87" />
      {/* Bottom/right facet */}
      <polygon points="100,43.3 100,86.6 50,115.47 0,86.6 5,77.9 85,31.7" />
    </svg>
  );
}
