import * as React from "react";
import { BrandLogoMark } from "@/components/hex/brand-logo-mark";
import { cn } from "@/lib/utils";

export interface BrandLogoLockupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  markSize?: number;
  orientation?: "horizontal" | "vertical";
}

export function BrandLogoLockup({
  markSize = 36,
  orientation = "horizontal",
  className,
  ...props
}: BrandLogoLockupProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 select-none",
        orientation === "vertical" && "flex-col text-center",
        className
      )}
      {...props}
    >
      <BrandLogoMark size={markSize} className="text-primary" />
      <div className="flex flex-col">
        <span className="font-extrabold tracking-tight text-foreground text-sm uppercase md:text-base leading-tight">
          Lonnex Njenga
        </span>
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground leading-none">
          The Hive
        </span>
      </div>
    </div>
  );
}
