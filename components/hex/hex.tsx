import * as React from "react";
import { HEX_CLIP_PATH, calcHexWidth } from "@/lib/hex";
import { cn } from "@/lib/utils";

export interface HexProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number;
  width?: number;
  fill?: "surface" | "primary" | "background" | "invert" | "none";
  border?: boolean;
  children?: React.ReactNode;
}

const fillClasses = {
  surface: "bg-surface text-foreground",
  primary: "bg-primary text-primary-foreground",
  background: "bg-background text-foreground",
  invert: "bg-invert text-invert-foreground",
  none: "bg-transparent text-foreground",
};

export function Hex({
  height = 120,
  width,
  fill = "surface",
  border = true,
  className,
  style,
  children,
  ...props
}: HexProps) {
  const actualWidth = width ?? calcHexWidth(height);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{
        width: `${actualWidth}px`,
        height: `${height}px`,
        ...style,
      }}
      {...props}
    >
      {/* Hex background container with clip-path */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-colors",
          fillClasses[fill]
        )}
        style={{ clipPath: HEX_CLIP_PATH }}
      >
        {children}
      </div>

      {/* Hex SVG border overlay if enabled */}
      {border && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full stroke-border fill-none"
          viewBox="0 0 100 115.47"
          preserveAspectRatio="none"
        >
          <polygon
            points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}
