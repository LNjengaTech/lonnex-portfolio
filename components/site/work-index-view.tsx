"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HEX_CLIP_PATH, calcHexWidth } from "@/lib/hex";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";
import { HexEmptyState } from "@/components/hex/hex-empty-state";
import { cn } from "@/lib/utils";
import type { PublicProjectItem } from "@/lib/db/queries/projects";

interface WorkIndexViewProps {
  projects: PublicProjectItem[];
  matchingProjectIds: Set<number>;
  className?: string;
}

export function WorkIndexView({
  projects,
  matchingProjectIds,
  className,
}: WorkIndexViewProps) {
  const [hoveredProject, setHoveredProject] =
    React.useState<PublicProjectItem | null>(null);
  const [cursorPos, setCursorPos] = React.useState<{ x: number; y: number }>({
    x: -9999,
    y: -9999,
  });

  const previewHeight = 220;
  const previewWidth = calcHexWidth(previewHeight);

  // Track cursor position for the floating preview hex
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeaveList = React.useCallback(() => {
    setHoveredProject(null);
  }, []);

  const activeCoverUrl = hoveredProject
    ? resolveMediaUrl(
        hoveredProject.coverMedia?.url || hoveredProject.coverMedia?.cloudinaryId,
        { width: 600, height: 450 }
      )
    : "";

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeaveList}
      className={cn("relative w-full py-6 select-none", className)}
    >
      {/* ── Floating Cursor-Following Hex Preview (Desktop Only) ── */}
      {hoveredProject && (
        <div
          className="pointer-events-none fixed z-50 hidden md:block transition-opacity duration-150 ease-out"
          style={{
            left: `${cursorPos.x + 24}px`,
            top: `${cursorPos.y - previewHeight / 2}px`,
            width: `${previewWidth}px`,
            height: `${previewHeight}px`,
          }}
        >
          {/* Hard Offset Electric Blue Wireframe Accent */}
          <div
            className="absolute inset-0 -translate-x-2 translate-y-2 bg-primary/40 -z-10"
            style={{ clipPath: HEX_CLIP_PATH }}
            aria-hidden="true"
          />

          {/* Hex Clipped Preview Image */}
          <div
            className="absolute inset-0 bg-surface border border-primary shadow-2xl overflow-hidden"
            style={{ clipPath: HEX_CLIP_PATH }}
          >
            {activeCoverUrl ? (
              <img
                src={activeCoverUrl}
                alt={hoveredProject.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface font-mono text-xs text-muted-foreground uppercase">
                {hoveredProject.title}
              </div>
            )}
            <div className="absolute inset-0 bg-background/30" />
            <div className="absolute inset-x-0 bottom-3 text-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-primary-foreground bg-primary px-2 py-0.5">
                {hoveredProject.category.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Giant Typographic Project List ── */}
      {projects.length === 0 ? (
        <HexEmptyState
          title="No projects in index"
          message="No engineering projects match the active criteria."
        />
      ) : (
        <div className="flex flex-col divide-y divide-border">
        {projects.map((p, idx) => {
          const isMatch = matchingProjectIds.has(p.id);
          const numLabel = String(idx + 1).padStart(2, "0");
          const categoryLabel = p.category.replace("_", " ");
          const mobileCoverUrl = resolveMediaUrl(
            p.coverMedia?.url || p.coverMedia?.cloudinaryId,
            { width: 300, height: 200 }
          );

          return (
            <Link
              key={p.id}
              href={`/work/${p.slug}`}
              onMouseEnter={() => setHoveredProject(p)}
              onFocus={() => setHoveredProject(p)}
              className={cn(
                "group relative flex flex-col md:flex-row md:items-center justify-between py-6 sm:py-8 md:py-10 transition-all duration-300",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                !isMatch && "opacity-30 hover:opacity-70 line-through md:no-underline"
              )}
            >
              {/* Left Column: Number & Giant Title */}
              <div className="flex items-start md:items-center gap-4 sm:gap-6 lg:gap-8">
                {/* Number */}
                <span className="font-mono text-sm sm:text-base md:text-lg text-primary tracking-[0.3em] font-bold mt-1 md:mt-0 flex-shrink-0">
                  {numLabel}
                </span>

                {/* Title (8vw scale) */}
                <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-[7vw] font-black uppercase tracking-tight leading-none text-foreground group-hover:text-primary transition-colors duration-200">
                  {p.title}
                </h2>
              </div>

              {/* Right Column: Metadata & Tech Tags */}
              <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3 md:gap-4 justify-between md:justify-end">
                {/* Category & Year */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-primary bg-surface border border-border px-2 py-0.5">
                    {categoryLabel}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {p.year}
                  </span>
                </div>

                {/* Stack Tags */}
                {p.stack && p.stack.length > 0 && (
                  <div className="hidden lg:flex items-center gap-1.5">
                    {p.stack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[10px] uppercase tracking-wider bg-background text-muted-foreground border border-border px-1.5 py-0.5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Mobile Inline Hex Thumbnail */}
                <div
                  className="block md:hidden h-12 w-10 flex-shrink-0 overflow-hidden bg-surface border border-border"
                  style={{ clipPath: HEX_CLIP_PATH }}
                >
                  {mobileCoverUrl && (
                    <img
                      src={mobileCoverUrl}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* Arrow Link Icon */}
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-200" />
              </div>
            </Link>
          );
        })}
        </div>
      )}
    </div>
  );
}
