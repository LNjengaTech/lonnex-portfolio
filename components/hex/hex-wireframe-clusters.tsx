"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface HexWireframeClustersProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Screen variant to display */
  variant?: "all" | "desktop" | "mobile" | "left" | "right";
  /** Stroke width in px */
  strokeWidth?: number;
  /** Whether the parent has mounted (controls smooth entrance fade) */
  mounted?: boolean;
}

/**
 * Minimalist geometric UI design asset featuring clusters of interconnected
 * hexagonal wireframe outlines with very thin primary blue stroke lines,
 * hollow shapes, and true circular glowing dots at every shared vertex.
 *
 * Designed for responsive empty space framing on both mobile and large screens.
 */
export function HexWireframeClusters({
  variant = "all",
  strokeWidth = 0.65,
  mounted = true,
  className,
  ...props
}: HexWireframeClustersProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none overflow-hidden",
        "transition-opacity duration-1000",
        mounted ? "opacity-100" : "opacity-0",
        className
      )}
      {...props}
    >
      {/* ── Desktop & Tablet View (≥ 640px) ─────────────────────────────────── */}
      {(variant === "all" || variant === "desktop") && (
        <div className="hidden sm:block absolute inset-0 w-full h-full">
          <svg
            className="w-full h-full text-primary"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <ClusterGlowDefs idPrefix="dt" />
            <DesktopLeftCluster strokeWidth={strokeWidth} filterId="dt-glow" />
            <DesktopRightCluster strokeWidth={strokeWidth} filterId="dt-glow" />
          </svg>
        </div>
      )}

      {/* ── Standalone Left Cluster (when variant="left") ───────────────────── */}
      {variant === "left" && (
        <svg
          className="w-full h-full text-primary"
          viewBox="0 0 750 1050"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <ClusterGlowDefs idPrefix="left" />
          <g transform="translate(40, 20)">
            <LeftClusterPolygons strokeWidth={strokeWidth} />
            <LeftClusterDots filterId="left-glow" />
          </g>
        </svg>
      )}

      {/* ── Standalone Right Cluster (when variant="right") ──────────────────── */}
      {variant === "right" && (
        <svg
          className="w-full h-full text-primary"
          viewBox="0 0 750 1050"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <ClusterGlowDefs idPrefix="right" />
          <g transform="translate(-1180, 20)">
            <RightClusterPolygons strokeWidth={strokeWidth} />
            <RightClusterDots filterId="right-glow" />
          </g>
        </svg>
      )}

      {/* ── Small / Mobile Screens (< 640px) ───────────────────────────────── */}
      {(variant === "all" || variant === "mobile") && (
        <div className="block sm:hidden absolute inset-0 w-full h-full">
          <svg
            className="w-full h-full text-primary"
            viewBox="0 0 420 840"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <ClusterGlowDefs idPrefix="mob" />
            <MobileClusters strokeWidth={strokeWidth * 0.8} filterId="mob-glow" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ── SVG Filter Defs (No Gradients) ───────────────────────────────────────── */
function ClusterGlowDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <filter
        id={`${idPrefix}-glow`}
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.3" result="blur1" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="blur1" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

/* ── Desktop Left Cluster ─────────────────────────────────────────────────── */
function DesktopLeftCluster({
  strokeWidth,
  filterId,
}: {
  strokeWidth: number;
  filterId: string;
}) {
  return (
    <g id="desktop-cluster-left">
      <LeftClusterPolygons strokeWidth={strokeWidth} />
      <LeftClusterDots filterId={filterId} />
    </g>
  );
}

function LeftClusterPolygons({ strokeWidth }: { strokeWidth: number }) {
  return (
    <>
      {/* Hex L_Main: Center (370, 520), R = 190 */}
      <polygon
        points="370,330 534.54,425 534.54,615 370,710 205.46,615 205.46,425"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Hex L_UpperRight: Center (534.54, 235), R = 190 */}
      <polygon
        points="534.54,45 699.08,140 699.08,330 534.54,425 370,330 370,140"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Hex L_LowerLeft: Center (205.46, 805), R = 190 */}
      <polygon
        points="205.46,615 370,710 370,900 205.46,995 40.92,900 40.92,710"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Hex L_West: Center (40.92, 520), R = 190 */}
      <polygon
        points="40.92,330 205.46,425 205.46,615 40.92,710 -123.62,615 -123.62,425"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Thin Connective Architectural Guide Rays */}
      <line
        x1="534.54"
        y1="45"
        x2="370"
        y2="140"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="699.08"
        y1="330"
        x2="534.54"
        y2="425"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="40.92"
        y1="900"
        x2="205.46"
        y2="995"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />
    </>
  );
}

function LeftClusterDots({ filterId }: { filterId: string }) {
  // Shared vertices where hexagonal edges meet:
  // (370, 330), (534.54, 425), (205.46, 425), (205.46, 615), (370, 710), (40.92, 710)
  // Plus key apex constellation vertices:
  // (534.54, 45), (699.08, 140), (205.46, 995), (40.92, 330)
  const dots = [
    { cx: 370, cy: 330, r: 2.1, halo: 3.6 },
    { cx: 534.54, cy: 425, r: 2.1, halo: 3.6 },
    { cx: 205.46, cy: 425, r: 2.1, halo: 3.6 },
    { cx: 205.46, cy: 615, r: 2.3, halo: 4.2 }, // triple shared vertex
    { cx: 370, cy: 710, r: 2.1, halo: 3.6 },
    { cx: 40.92, cy: 710, r: 2.1, halo: 3.6 },
    { cx: 534.54, cy: 45, r: 2.1, halo: 3.6 },
    { cx: 699.08, cy: 140, r: 1.8, halo: 3.1 },
    { cx: 205.46, cy: 995, r: 1.8, halo: 3.1 },
    { cx: 40.92, cy: 330, r: 1.8, halo: 3.1 },
  ];

  return (
    <>
      {dots.map((d, i) => (
        <g key={`l-dot-${i}`}>
          {/* Subtle concentric halo circle (true circle, no gradient) */}
          <circle
            cx={d.cx}
            cy={d.cy}
            r={d.halo}
            fill="currentColor"
            fillOpacity={0.25}
          />
          {/* Glowing core circle (true circle, neon glow filter) */}
          <circle
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="currentColor"
            filter={`url(#${filterId})`}
          />
        </g>
      ))}
    </>
  );
}

/* ── Desktop Right Cluster ────────────────────────────────────────────────── */
function DesktopRightCluster({
  strokeWidth,
  filterId,
}: {
  strokeWidth: number;
  filterId: string;
}) {
  return (
    <g id="desktop-cluster-right">
      <RightClusterPolygons strokeWidth={strokeWidth} />
      <RightClusterDots filterId={filterId} />
    </g>
  );
}

function RightClusterPolygons({ strokeWidth }: { strokeWidth: number }) {
  return (
    <>
      {/* Hex R_Main: Center (1550, 520), R = 190 */}
      <polygon
        points="1550,330 1714.54,425 1714.54,615 1550,710 1385.46,615 1385.46,425"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Hex R_UpperLeft: Center (1385.46, 235), R = 190 */}
      <polygon
        points="1385.46,45 1550,140 1550,330 1385.46,425 1220.92,330 1220.92,140"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Hex R_LowerRight: Center (1714.54, 805), R = 190 */}
      <polygon
        points="1714.54,615 1879.08,710 1879.08,900 1714.54,995 1550,900 1550,710"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Hex R_East: Center (1879.08, 520), R = 190 */}
      <polygon
        points="1879.08,330 2043.62,425 2043.62,615 1879.08,710 1714.54,615 1714.54,425"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Thin Connective Architectural Guide Rays */}
      <line
        x1="1385.46"
        y1="45"
        x2="1550"
        y2="140"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="1220.92"
        y1="330"
        x2="1385.46"
        y2="425"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="1714.54"
        y1="995"
        x2="1879.08"
        y2="900"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />
    </>
  );
}

function RightClusterDots({ filterId }: { filterId: string }) {
  // Shared vertices where hexagonal edges meet:
  // (1550, 330), (1385.46, 425), (1714.54, 425), (1714.54, 615), (1550, 710), (1879.08, 710)
  // Plus key apex constellation vertices:
  // (1385.46, 45), (1220.92, 330), (1714.54, 995), (1879.08, 330)
  const dots = [
    { cx: 1550, cy: 330, r: 2.1, halo: 3.6 },
    { cx: 1385.46, cy: 425, r: 2.1, halo: 3.6 },
    { cx: 1714.54, cy: 425, r: 2.1, halo: 3.6 },
    { cx: 1714.54, cy: 615, r: 2.3, halo: 4.2 }, // triple shared vertex
    { cx: 1550, cy: 710, r: 2.1, halo: 3.6 },
    { cx: 1879.08, cy: 710, r: 2.1, halo: 3.6 },
    { cx: 1385.46, cy: 45, r: 2.1, halo: 3.6 },
    { cx: 1220.92, cy: 330, r: 1.8, halo: 3.1 },
    { cx: 1714.54, cy: 995, r: 1.8, halo: 3.1 },
    { cx: 1879.08, cy: 330, r: 1.8, halo: 3.1 },
  ];

  return (
    <>
      {dots.map((d, i) => (
        <g key={`r-dot-${i}`}>
          <circle
            cx={d.cx}
            cy={d.cy}
            r={d.halo}
            fill="currentColor"
            fillOpacity={0.25}
          />
          <circle
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="currentColor"
            filter={`url(#${filterId})`}
          />
        </g>
      ))}
    </>
  );
}

/* ── Mobile Screen Clusters (< 640px) ─────────────────────────────────────── */
function MobileClusters({
  strokeWidth,
  filterId,
}: {
  strokeWidth: number;
  filterId: string;
}) {
  const mobileDots = [
    // Top-Left Cluster shared and apex vertices
    { cx: 100.03, cy: 156, r: 1.5, halo: 2.8 },
    { cx: 55, cy: 182, r: 1.5, halo: 2.8 },
    { cx: 55, cy: 78, r: 1.3, halo: 2.5 },
    { cx: 145.06, cy: 182, r: 1.3, halo: 2.5 },
    // Mid-Right Cluster shared and apex vertices
    { cx: 319.97, cy: 296, r: 1.5, halo: 2.8 },
    { cx: 365, cy: 322, r: 1.5, halo: 2.8 },
    { cx: 365, cy: 218, r: 1.3, halo: 2.5 },
    { cx: 274.94, cy: 374, r: 1.3, halo: 2.5 },
    // Lower-Left Cluster shared and apex vertices
    { cx: 110.03, cy: 626, r: 1.5, halo: 2.8 },
    { cx: 65, cy: 652, r: 1.5, halo: 2.8 },
    { cx: 65, cy: 548, r: 1.3, halo: 2.5 },
    { cx: 110.03, cy: 730, r: 1.3, halo: 2.5 },
  ];

  return (
    <g id="mobile-clusters">
      {/* ── 1. Top-Left Mobile Cluster ───────────────────────────────────── */}
      <polygon
        points="55,78 100.03,104 100.03,156 55,182 9.97,156 9.97,104"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <polygon
        points="100.03,156 145.06,182 145.06,234 100.03,260 55,234 55,182"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <line
        x1="55"
        y1="78"
        x2="9.97"
        y2="104"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />

      {/* ── 2. Mid-Right Mobile Cluster ──────────────────────────────────── */}
      <polygon
        points="365,218 410.03,244 410.03,296 365,322 319.97,296 319.97,244"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <polygon
        points="319.97,296 365,322 365,374 319.97,400 274.94,374 274.94,322"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <line
        x1="365"
        y1="374"
        x2="319.97"
        y2="400"
        stroke="currentColor"
        strokeWidth={strokeWidth * 0.7}
        strokeOpacity={0.6}
        vectorEffect="non-scaling-stroke"
      />

      {/* ── 3. Lower-Left Mobile Cluster ─────────────────────────────────── */}
      <polygon
        points="65,548 110.03,574 110.03,626 65,652 19.97,626 19.97,574"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />
      <polygon
        points="110.03,626 155.06,652 155.06,704 110.03,730 65,704 65,652"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        vectorEffect="non-scaling-stroke"
        fill="none"
      />

      {/* Mobile Glowing Vertex Dots (True Circles) */}
      {mobileDots.map((d, i) => (
        <g key={`m-dot-${i}`}>
          <circle
            cx={d.cx}
            cy={d.cy}
            r={d.halo}
            fill="currentColor"
            fillOpacity={0.25}
          />
          <circle
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill="currentColor"
            filter={`url(#${filterId})`}
          />
        </g>
      ))}
    </g>
  );
}
