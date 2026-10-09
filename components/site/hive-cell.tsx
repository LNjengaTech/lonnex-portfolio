"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { HEX_CLIP_PATH } from "@/lib/hex";

export interface HiveCellData {
  number: string;
  label: string;
  href: string;
  preview?: string;       // short live preview text (e.g. latest article title)
  subtext?: string;       // secondary meta (count, date, etc.)
  accentDot?: boolean;    // show availability dot
  dotColor?: string;      // Tailwind class e.g. "bg-success"
}

interface HiveCellProps {
  data: HiveCellData;
  /** Pixel size of the hex height */
  size?: number;
  /** Whether this is the center photo cell */
  isCenter?: boolean;
  className?: string;
}

/**
 * Single honeycomb navigation cell.
 * Pointy-top hex, scales from vertex on hover, label becomes large.
 * Respects prefers-reduced-motion.
 */
export function HiveCell({ data, size = 160, isCenter = false, className }: HiveCellProps) {
  const width = Math.round(size * Math.sqrt(3) / 2);

  return (
    <Link
      href={data.href}
      className={cn(
        "group relative flex items-center justify-center select-none transition-transform duration-300",
        "motion-safe:hover:scale-105 active:scale-95",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2",
        className
      )}
      style={{ width, height: size }}
      aria-label={`${data.label} — ${data.preview ?? ""}`}
    >
      {/* Base hex background */}
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-300",
          isCenter ? "bg-primary" : "bg-surface border border-border",
          !isCenter && "group-hover:bg-primary group-focus-visible:bg-primary"
        )}
        style={{ clipPath: HEX_CLIP_PATH }}
      />

      {/* Hard offset block (decorative, brand depth) */}
      {!isCenter && (
        <div
          className="absolute inset-0 -translate-x-1 translate-y-1 bg-border/40 -z-10 motion-safe:group-hover:-translate-x-2 motion-safe:group-hover:translate-y-2 transition-transform duration-300"
          style={{ clipPath: HEX_CLIP_PATH }}
          aria-hidden="true"
        />
      )}

      {/* Cell content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-1 px-3 text-center pointer-events-none w-full">
        {/* Number */}
        <span
          className={cn(
            "font-mono text-[9px] uppercase tracking-[0.35em] transition-colors duration-200",
            isCenter
              ? "text-primary-foreground/70"
              : "text-muted-foreground group-hover:text-primary-foreground/70 group-focus-visible:text-primary-foreground/70"
          )}
        >
          {data.number}
        </span>

        {/* Label — grows on hover */}
        <span
          className={cn(
            "font-black uppercase leading-tight tracking-tight transition-all duration-300",
            "text-sm group-hover:text-base motion-safe:group-hover:scale-110 motion-safe:group-hover:origin-center",
            isCenter
              ? "text-primary-foreground"
              : "text-foreground group-hover:text-primary-foreground group-focus-visible:text-primary-foreground"
          )}
        >
          {data.label}
        </span>

        {/* Preview text */}
        {data.preview && !isCenter && (
          <span
            className={cn(
              "font-mono text-[8px] leading-tight text-center line-clamp-2 transition-colors duration-200 max-w-[90%]",
              "text-muted-foreground group-hover:text-primary-foreground/70 group-focus-visible:text-primary-foreground/70"
            )}
          >
            {data.preview}
          </span>
        )}

        {/* Availability dot */}
        {data.accentDot && (
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full mt-0.5",
              data.dotColor ?? "bg-success"
            )}
          />
        )}
      </div>
    </Link>
  );
}
