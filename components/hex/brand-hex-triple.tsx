import * as React from "react";
import { cn } from "@/lib/utils";

export interface BrandHexTripleProps
  extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
  variant?: "solid" | "outline" | "mixed";
}

export function BrandHexTriple({
  size = 32,
  variant = "mixed",
  className,
  ...props
}: BrandHexTripleProps) {
  // Triple cluster of 3 adjacent pointy-top hexes
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={cn("inline-block flex-shrink-0", className)}
      {...props}
    >
      {/* Top Hex */}
      <polygon
        points="60,10 86,25 86,55 60,70 34,55 34,25"
        fill={variant === "outline" ? "none" : "currentColor"}
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Bottom-left Hex */}
      <polygon
        points="34,55 60,70 60,100 34,115 8,100 8,70"
        fill={variant === "solid" ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="3"
      />
      {/* Bottom-right Hex */}
      <polygon
        points="86,55 112,70 112,100 86,115 60,100 60,70"
        fill={variant === "outline" ? "none" : "currentColor"}
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}
