"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, Play } from "lucide-react";
import { HEX_CLIP_PATH, calcHexWidth } from "@/lib/hex";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";
import type { PublicProjectItem } from "@/lib/db/queries/projects";

interface ProjectHexTileProps {
  project: PublicProjectItem;
  height: number;
  numberLabel: string;
  isFilteredOut?: boolean;
  priority?: boolean;
  className?: string;
  enableHoverVideo?: boolean;
}

export function ProjectHexTile({
  project,
  height,
  numberLabel,
  isFilteredOut = false,
  className,
  enableHoverVideo = true,
}: ProjectHexTileProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const width = calcHexWidth(height);

  const coverUrl = resolveMediaUrl(
    project.coverMedia?.url || project.coverMedia?.cloudinaryId,
    { width: 800, height: 600 }
  );

  const videoUrl = resolveMediaUrl(
    project.previewVideo?.url || project.previewVideo?.cloudinaryId,
    { type: "video" }
  );

  // Responsive font sizes according to tile height
  const titleSize =
    height >= 340
      ? "text-lg md:text-xl"
      : height >= 240
      ? "text-sm md:text-base"
      : "text-xs md:text-sm";

  // Number format: uppercase category
  const categoryLabel = project.category.replace("_", " ");

  return (
    <Link
      href={`/work/${project.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={cn(
        "group relative flex items-center justify-center select-none transition-all duration-500",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4",
        isFilteredOut && "cursor-default opacity-40 hover:opacity-75",
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
      aria-label={`${project.title} — ${categoryLabel}${isFilteredOut ? " (unmatched)" : ""}`}
    >
      {/* ── Hard Offset Depth Layer (Hive Signature) ── */}
      {!isFilteredOut && (
        <div
          className={cn(
            "absolute inset-0 bg-primary/20 pointer-events-none -z-10 transition-transform duration-300",
            isHovered ? "-translate-x-2 translate-y-2 bg-primary/40" : "-translate-x-1 translate-y-1"
          )}
          style={{ clipPath: HEX_CLIP_PATH }}
          aria-hidden="true"
        />
      )}

      {/* ── Outer SVG Hex Border ── */}
      <svg
        className={cn(
          "pointer-events-none absolute inset-0 h-full w-full fill-none z-30 transition-colors duration-300",
          isFilteredOut
            ? "stroke-border/40 stroke-1 stroke-dasharray-[4_4]"
            : isHovered
            ? "stroke-primary stroke-2"
            : "stroke-border stroke-1"
        )}
        viewBox="0 0 100 115.47"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polygon
          points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* ── Main Clipped Hex Cell ── */}
      <div
        className={cn(
          "absolute inset-0 overflow-hidden transition-all duration-500",
          isFilteredOut
            ? "bg-surface/20 backdrop-blur-xs"
            : "bg-surface"
        )}
        style={{
          clipPath: HEX_CLIP_PATH,
          viewTransitionName: `project-hero-${project.slug}`,
        }}
      >
        {isFilteredOut ? (
          /* ── Outline-Only Mode for Filtered Tiles (Hive stays intact!) ── */
          <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50 mb-1">
              {numberLabel}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 line-clamp-2 max-w-[85%]">
              {project.title}
            </span>
            <span className="mt-2 font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 border border-border/30 px-1.5 py-0.5">
              {categoryLabel}
            </span>
          </div>
        ) : (
          /* ── Full Interactive Project Tile ── */
          <>
            {/* Background Media: Cover Image or Video Swap on Hover */}
            {coverUrl ? (
              <div
                className={cn(
                  "absolute inset-0 h-full w-full transition-transform duration-700 ease-out",
                  isHovered && "scale-105",
                  project.confidential && "filter blur-sm"
                )}
              >
                {enableHoverVideo && isHovered && videoUrl ? (
                  <video
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={coverUrl}
                    alt={project.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface text-muted-foreground font-mono text-xs uppercase">
                {project.title}
              </div>
            )}

            {/* Solid Dimmer Overlay for High Contrast Text */}
            <div
              className={cn(
                "absolute inset-0 transition-colors duration-300",
                isHovered ? "bg-background/60" : "bg-background/75"
              )}
            />

            {/* Confidential Shield Overlay */}
            {project.confidential && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-3 text-center z-10">
                <Lock className="h-5 w-5 text-warning mb-1" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-warning font-bold">
                  Confidential
                </span>
              </div>
            )}

            {/* Content Overlay */}
            <div className="relative z-20 flex h-full w-full flex-col items-center justify-between p-4 sm:p-5 text-center">
              {/* Top: Project Number & Category Chip */}
              <div className="flex flex-col items-center gap-1">
                <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-primary font-bold bg-background/90 px-2 py-0.5 border border-border/80">
                  {numberLabel}
                </span>
                <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {categoryLabel}
                </span>
              </div>

              {/* Center: Title & Looping Indicator */}
              <div className="flex flex-col items-center gap-1 max-w-[90%]">
                <h3
                  className={cn(
                    "font-black uppercase tracking-tight text-foreground transition-colors duration-200 line-clamp-2",
                    titleSize,
                    isHovered && "text-primary"
                  )}
                >
                  {project.title}
                </h3>

                {videoUrl && (
                  <div className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">
                    <Play className="h-2 w-2 text-primary fill-primary" />
                    <span>Clip Preview</span>
                  </div>
                )}
              </div>

              {/* Bottom: Stack Chips on Hover or Year */}
              <div className="flex flex-col items-center gap-1 w-full min-h-[24px]">
                {isHovered && project.stack && project.stack.length > 0 ? (
                  <div className="flex flex-wrap items-center justify-center gap-1 max-w-full">
                    {project.stack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="font-mono text-[8px] uppercase tracking-wider bg-surface/90 text-foreground border border-border px-1.5 py-0.5 line-clamp-1"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.stack.length > 3 && (
                      <span className="font-mono text-[8px] text-muted-foreground">
                        +{project.stack.length - 3}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                    {project.year}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
