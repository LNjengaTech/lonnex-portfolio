"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectHexTile } from "@/components/site/project-hex-tile";
import { HexEmptyState } from "@/components/hex/hex-empty-state";
import { calcHexWidth } from "@/lib/hex";
import type { PublicProjectItem } from "@/lib/db/queries/projects";

interface WorkTimelineViewProps {
  projects: PublicProjectItem[];
  matchingProjectIds: Set<number>;
  className?: string;
}

export function WorkTimelineView({
  projects,
  matchingProjectIds,
}: WorkTimelineViewProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Sort chronologically by year (descending) and order
  const chronologicalProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => {
      const yearDiff = b.year.localeCompare(a.year);
      if (yearDiff !== 0) return yearDiff;
      return a.order - b.order;
    });
  }, [projects]);

  // Unique years in chronological order
  const years = React.useMemo(() => {
    return Array.from(new Set(chronologicalProjects.map((p) => p.year)));
  }, [chronologicalProjects]);

  const tileHeight = 210;
  const tileWidth = calcHexWidth(tileHeight);
  const horizStep = Math.round(tileWidth * 0.95);
  const highY = 40;
  const lowY = 190;

  // Compute total width
  const totalTrackWidth = (chronologicalProjects.length + 1) * horizStep + 200;
  const totalTrackHeight = lowY + tileHeight + 40;

  // Build connecting SVG zigzag path
  const svgPathD = React.useMemo(() => {
    if (chronologicalProjects.length === 0) return "";
    return chronologicalProjects.reduce((acc, _, idx) => {
      const x = 120 + idx * horizStep;
      const y = (idx % 2 === 0 ? highY : lowY) + tileHeight / 2;
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");
  }, [chronologicalProjects, horizStep, tileHeight]);

  function scroll(direction: "left" | "right") {
    if (!scrollContainerRef.current) return;
    const delta = direction === "left" ? -400 : 400;
    scrollContainerRef.current.scrollBy({ left: delta, behavior: "smooth" });
  }

  if (projects.length === 0) {
    return (
      <HexEmptyState
        title="No projects in timeline"
        message="No engineering projects recorded across the timeline."
      />
    );
  }

  return (
    <div className="relative w-full py-4 select-none">
      {/* Scroll Navigation Header & Year Legend */}
      <div className="flex items-center justify-between px-2 mb-4">
        {/* Year badges */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground mr-1">
            Milestones:
          </span>
          {years.map((year) => (
            <span
              key={year}
              className="font-mono text-xs uppercase tracking-widest bg-surface text-primary border border-border px-2 py-0.5"
            >
              {year}
            </span>
          ))}
        </div>

        {/* Scroll Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll timeline left"
            className="p-1.5 bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll timeline right"
            className="p-1.5 bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Scrollable 60-Degree Zig-Zag Track ── */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-surface/50"
      >
        <div
          className="relative min-w-full"
          style={{
            width: `${totalTrackWidth}px`,
            height: `${totalTrackHeight}px`,
          }}
        >
          {/* Connecting 60° Axial Guideline */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full stroke-primary/30 stroke-2 fill-none stroke-dasharray-[6_4]"
            style={{ width: `${totalTrackWidth}px`, height: `${totalTrackHeight}px` }}
            aria-hidden="true"
          >
            <path d={svgPathD} vectorEffect="non-scaling-stroke" />
          </svg>

          {/* Hex Project Tiles along the 60° Zig-Zag */}
          {chronologicalProjects.map((p, idx) => {
            const isMatch = matchingProjectIds.has(p.id);
            const numLabel = String(idx + 1).padStart(2, "0");
            const isHigh = idx % 2 === 0;
            const posX = 120 + idx * horizStep;
            const posY = isHigh ? highY : lowY;

            return (
              <div
                key={p.id}
                className="absolute transition-transform duration-500"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  transform: "translate(-50%, 0)",
                }}
              >
                {/* Milestone Year Header Tag */}
                <div className="flex flex-col items-center mb-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground bg-background/90 px-1.5 py-0.5 border border-border/60">
                    {p.year}
                  </span>
                </div>

                <ProjectHexTile
                  project={p}
                  height={tileHeight}
                  numberLabel={numLabel}
                  isFilteredOut={!isMatch}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
