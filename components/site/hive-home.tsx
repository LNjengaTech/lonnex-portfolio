"use client";

import { useEffect, useState } from "react";
import { CloudImage } from "@/components/site/cloud-image";
import { HiveCell, HiveCellData } from "@/components/site/hive-cell";
import { HexGrid } from "@/components/hex/hex-grid";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

interface HiveHomeProps {
  profileName: string;
  profilePhotoUrl?: string | null;
  heroText: string;
  availabilityStatus: "available" | "limited" | "booked";
  availabilityMessage?: string;
  /** Live room data */
  latestArticleTitle?: string | null;
  activeProjectName?: string | null;
  studioCount?: number;
  projectCount?: number;
  articleCount?: number;
  /** DB stat overrides */
  stats?: { label: string; value: string }[];
}

const AVAILABILITY_DOT: Record<string, string> = {
  available: "bg-success",
  limited: "bg-warning",
  booked: "bg-danger",
};

export function HiveHome({
  profileName,
  profilePhotoUrl,
  heroText,
  availabilityStatus,
  latestArticleTitle,
  activeProjectName,
  studioCount = 0,
  projectCount = 0,
  articleCount = 0,
  stats,
}: HiveHomeProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roomCells: HiveCellData[] = [
    {
      number: "01",
      label: "Work",
      href: "/work",
      preview: activeProjectName ?? `${projectCount} projects`,
      subtext: `${projectCount} projects`,
    },
    {
      number: "02",
      label: "Studio",
      href: "/studio",
      preview: `${studioCount} works`,
      subtext: "design & video",
    },
    {
      number: "03",
      label: "Journal",
      href: "/journal",
      preview: latestArticleTitle ?? `${articleCount} articles`,
      subtext: `${articleCount} articles`,
    },
    {
      number: "04",
      label: "About",
      href: "/about",
      preview: "Skills & background",
    },
    {
      number: "05",
      label: "Now",
      href: "/now",
      preview: availabilityStatus,
      accentDot: true,
      dotColor: AVAILABILITY_DOT[availabilityStatus],
    },
    {
      number: "06",
      label: "Contact",
      href: "/contact",
      preview: "Start a project",
    },
  ];

  const defaultStats = [
    { label: "Web & Mobile Apps", value: `${Math.max(projectCount, 1)}+` },
    { label: "Design Projects", value: `${Math.max(studioCount, 1)}+` },
    { label: "Journal Articles", value: `${Math.max(articleCount, 1)}+` },
  ];
  const displayStats = stats ?? defaultStats;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex flex-col justify-between overflow-x-hidden">
      {/* Background breathing hex grid */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.035]"
        aria-hidden="true"
      >
        <HexGrid
          rows={12}
          cols={16}
          cellSize={46}
          breathe
          className="w-full h-full"
        />
      </div>

      {/* ── Main Honeycomb Section ───────────────────────────────────────── */}
      <section
        className="relative flex flex-1 flex-col items-center justify-center pt-8 pb-12 px-4 sm:px-6 lg:px-8"
        aria-label="Hive home"
      >
        {/* Minimalist geometric wireframe clusters in empty space positions */}
        <HexWireframeClusters
          mounted={mounted}
          className="absolute inset-0 z-0 pointer-events-none opacity-85 dark:opacity-100"
        />

        {/* Name headline */}
        <div className="relative z-10 text-center mb-6 sm:mb-8">
          <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.35em] text-muted-foreground mb-2">
            The Hive
          </p>
          <h1
            className={cn(
              "font-black tracking-tight text-foreground transition-all duration-700 motion-safe:transition-all",
              "text-3xl sm:text-5xl md:text-6xl lg:text-7xl",
              "leading-none",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {profileName}
          </h1>
        </div>

        {/* ── MOBILE VIEW (< 640px): Interlocking Vertical Zig-Zag ───────── */}
        <div className="relative z-10 block sm:hidden w-full max-w-[280px] mx-auto my-4">
          <MobileInterlockingHive
            cells={roomCells}
            photoUrl={profilePhotoUrl}
            name={profileName}
            mounted={mounted}
          />
        </div>

        {/* ── TABLET & DESKTOP (≥ 640px): 7-Hex Mathematical Honeycomb ───── */}
        <div className="relative z-10 hidden sm:flex items-center justify-center my-6">
          <DesktopHoneycombCluster
            cells={roomCells}
            photoUrl={profilePhotoUrl}
            name={profileName}
            mounted={mounted}
            hoveredRoom={hoveredRoom}
            setHoveredRoom={setHoveredRoom}
          />
        </div>

        {/* Dynamic Room Banner / Headline on Hover (Desktop) */}
        <div className="relative z-10 hidden sm:flex h-8 items-center justify-center mt-2">
          {hoveredRoom ? (
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary transition-opacity animate-in fade-in duration-200">
              [ {hoveredRoom} ]
            </span>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Select a cell to enter
            </span>
          )}
        </div>

        {/* Hero tagline */}
        <p
          className={cn(
            "relative z-10 mt-4 sm:mt-6 max-w-xl text-center font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground uppercase tracking-[0.2em] px-4",
            mounted ? "opacity-100" : "opacity-0",
            "transition-opacity duration-1000 delay-500"
          )}
        >
          {heroText}
        </p>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────────────── */}
      <section
        aria-label="Portfolio statistics"
        className={cn(
          "border-t border-border bg-surface/90 backdrop-blur-sm",
          mounted ? "opacity-100" : "opacity-0",
          "transition-opacity duration-700 delay-700"
        )}
      >
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-3 divide-x divide-border">
            {displayStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center py-4 sm:py-6 px-2 text-center"
              >
                <dt className="font-mono text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.25em] text-muted-foreground order-2 mt-1">
                  {stat.label}
                </dt>
                <dd className="font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl text-foreground order-1">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}

/* ── 1. Desktop & Tablet: Mathematical 7-Hex Honeycomb Cluster ───────────── */
function DesktopHoneycombCluster({
  cells,
  photoUrl,
  name,
  mounted,
  setHoveredRoom,
}: {
  cells: HiveCellData[];
  photoUrl?: string | null;
  name: string;
  mounted: boolean;
  hoveredRoom: string | null;
  setHoveredRoom: (room: string | null) => void;
}) {
  /**
   * Exact pointy-top hexagon geometry:
   * Width = height * sqrt(3)/2
   *
   * Responsive heights:
   * - Tablet (640-1023px): H = 136px, W = 117.8px
   * - Desktop (>=1024px):  H = 164px, W = 142.0px
   */
  return (
    <>
      <div className="block lg:hidden">
        <HoneycombInner
          cells={cells}
          photoUrl={photoUrl}
          name={name}
          height={136}
          mounted={mounted}
          setHoveredRoom={setHoveredRoom}
        />
      </div>
      <div className="hidden lg:block">
        <HoneycombInner
          cells={cells}
          photoUrl={photoUrl}
          name={name}
          height={164}
          mounted={mounted}
          setHoveredRoom={setHoveredRoom}
        />
      </div>
    </>
  );
}

function HoneycombInner({
  cells,
  photoUrl,
  name,
  height,
  mounted,
  setHoveredRoom,
}: {
  cells: HiveCellData[];
  photoUrl?: string | null;
  name: string;
  height: number;
  mounted: boolean;
  setHoveredRoom: (room: string | null) => void;
}) {
  const width = Math.round(height * (Math.sqrt(3) / 2) * 100) / 100;

  // Interlocking grid offsets for 7-hex pointy-top flower:
  // Row 0: Work (0.5 W), Studio (1.5 W) at y = 0
  // Row 1: Contact (0), Photo (W), Journal (2 W) at y = 0.75 H
  // Row 2: Now (0.5 W), About (1.5 W) at y = 1.5 H
  const positions: Array<{ x: number; y: number; cell: HiveCellData; delay: number }> = [
    { x: 0.5 * width, y: 0, cell: cells[0], delay: 100 },              // Work
    { x: 1.5 * width, y: 0, cell: cells[1], delay: 150 },              // Studio
    { x: 2.0 * width, y: 0.75 * height, cell: cells[2], delay: 200 },  // Journal
    { x: 1.5 * width, y: 1.5 * height, cell: cells[3], delay: 250 },   // About
    { x: 0.5 * width, y: 1.5 * height, cell: cells[4], delay: 300 },   // Now
    { x: 0, y: 0.75 * height, cell: cells[5], delay: 350 },            // Contact
  ];

  const containerW = Math.round(3 * width);
  const containerH = Math.round(2.5 * height);

  return (
    <div
      className="relative select-none"
      style={{ width: containerW, height: containerH }}
    >
      {/* Centre Photo Cell */}
      <div
        className={cn(
          "absolute z-10 transition-all duration-500",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
        style={{
          left: Math.round(width),
          top: Math.round(0.75 * height),
          width: Math.round(width),
          height: Math.round(height),
        }}
      >
        <PhotoCenterCell photoUrl={photoUrl} name={name} height={height} width={width} />
      </div>

      {/* 6 Surrounding Rooms */}
      {positions.map(({ x, y, cell, delay }) => (
        <div
          key={cell.href}
          onMouseEnter={() => setHoveredRoom(cell.label)}
          onMouseLeave={() => setHoveredRoom(null)}
          className={cn(
            "absolute z-20 transition-all duration-500 hover:z-30",
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}
          style={{
            left: Math.round(x),
            top: Math.round(y),
            transitionDelay: mounted ? `${delay}ms` : "0ms",
          }}
        >
          <HiveCell data={cell} size={height} />
        </div>
      ))}
    </div>
  );
}

/* ── 2. Mobile View: Interlocking Vertical Zig-Zag Column ────────────────── */
function MobileInterlockingHive({
  cells,
  photoUrl,
  name,
  mounted,
}: {
  cells: HiveCellData[];
  photoUrl?: string | null;
  name: string;
  mounted: boolean;
}) {
  const height = 120;
  const width = Math.round(height * (Math.sqrt(3) / 2));
  const vertStep = Math.round(height * 0.75); // 90px
  const horizShift = Math.round(width * 0.45); // ~47px

  // Interlocking layout:
  // Item 0 (Photo): center (horizShift / 2, 0)
  // Item 1 (Work): left (0, 1 * vertStep)
  // Item 2 (Studio): right (horizShift, 2 * vertStep)
  // Item 3 (Journal): left (0, 3 * vertStep)
  // Item 4 (About): right (horizShift, 4 * vertStep)
  // Item 5 (Now): left (0, 5 * vertStep)
  // Item 6 (Contact): right (horizShift, 6 * vertStep)
  const totalW = width + horizShift;
  const totalH = height + 6 * vertStep;

  return (
    <div
      className="relative mx-auto"
      style={{ width: totalW, height: totalH }}
    >
      {/* Photo at the top */}
      <div
        className={cn(
          "absolute z-10 transition-all duration-500",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}
        style={{
          left: Math.round(horizShift / 2),
          top: 0,
          width,
          height,
        }}
      >
        <PhotoCenterCell photoUrl={photoUrl} name={name} height={height} width={width} />
      </div>

      {/* 6 Zig-zagging room cells */}
      {cells.map((cell, idx) => {
        const isRight = idx % 2 === 1;
        const x = isRight ? horizShift : 0;
        const y = (idx + 1) * vertStep;

        return (
          <div
            key={cell.href}
            className={cn(
              "absolute z-20 transition-all duration-500",
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
            style={{
              left: x,
              top: y,
              transitionDelay: mounted ? `${(idx + 1) * 70}ms` : "0ms",
            }}
          >
            <HiveCell data={cell} size={height} />
          </div>
        );
      })}
    </div>
  );
}

/* ── Centre Photo Cell with Hard Blue Offset Layer ───────────────────────── */
function PhotoCenterCell({
  photoUrl,
  name,
  height,
  width,
}: {
  photoUrl?: string | null;
  name: string;
  height: number;
  width: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width, height }}
      aria-label={`${name} — profile photo`}
    >
      {/* Hard offset electric blue hex behind photo */}
      <div
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 sm:translate-x-2 sm:translate-y-2 bg-primary -z-10"
        style={{ clipPath: HEX_CLIP_PATH }}
        aria-hidden="true"
      />

      {/* Hex Photo Frame */}
      <div
        className="relative w-full h-full overflow-hidden bg-surface border border-border"
        style={{ clipPath: HEX_CLIP_PATH }}
      >
        {photoUrl ? (
          <CloudImage
            publicId={photoUrl}
            alt={`${name} — profile photo`}
            width={Math.round(width)}
            height={Math.round(height)}
            fill
            priority
            sizes={`${Math.round(width)}px`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-invert text-invert-foreground">
            <span className="font-black text-2xl sm:text-3xl">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
