import * as React from "react";
import { cn } from "@/lib/utils";

export interface BrandLogoMarkProps
  extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function BrandLogoMark({
  size = 32,
  className,
  ...props
}: BrandLogoMarkProps) {
  const height = size;
  const width = Math.round(size * 0.866025 * 100) / 100;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 115.47"
      fill="none"
      className={cn("inline-block flex-shrink-0", className)}
      {...props}
    >
      {/* Outer Pointy-Top Hexagon */}
      <polygon
        points="50,4 96,30.56 96,84.91 50,111.47 4,84.91 4,30.56"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="miter"
      />
      {/* Architectural 'L' monogram cut along 60-degree angles */}
      <path
        d="M32 28 V76 L68 96 H82 V82 L46 62 V28 Z"
        fill="currentColor"
      />
      {/* Inner Accent Hive Vertex */}
      <polygon
        points="50,34 68,44.39 68,65.19 50,75.59 32,65.19 32,44.39"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="4 4"
      />
    </svg>
  );
}
