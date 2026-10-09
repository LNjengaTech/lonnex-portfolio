"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HEX_CLIP_PATH, calcHexWidth } from "@/lib/hex";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";
import type { NextProjectPreview } from "@/lib/db/queries/projects";

interface ProjectNextHexProps {
  nextProject: NextProjectPreview;
  className?: string;
}

export function ProjectNextHex({ nextProject, className }: ProjectNextHexProps) {
  const height = 220;
  const width = calcHexWidth(height);

  const coverUrl = resolveMediaUrl(
    nextProject.coverMedia?.url || nextProject.coverMedia?.cloudinaryId,
    { width: 600, height: 450 }
  );

  return (
    <section
      aria-label="Next project navigation"
      className={cn("flex flex-col items-center py-12 sm:py-16 text-center select-none", className)}
    >
      {/* Brand Section Label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="h-px w-8 bg-border" />
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary font-bold">
          Next Project In The Hive
        </span>
        <span className="h-px w-8 bg-border" />
      </div>

      {/* Hex Flow Navigation Cell */}
      <Link
        href={`/work/${nextProject.slug}`}
        className="group relative flex flex-col items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        style={{ width: `${width}px`, height: `${height}px` }}
        aria-label={`Next project: ${nextProject.title}`}
      >
        {/* Hard Offset Electric Blue Wireframe Layer */}
        <div
          className="absolute inset-0 bg-primary/30 pointer-events-none -z-10 transition-transform duration-300 -translate-x-2 translate-y-2 group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:bg-primary/50"
          style={{ clipPath: HEX_CLIP_PATH }}
          aria-hidden="true"
        />

        {/* SVG Border Overlay */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full stroke-primary/40 group-hover:stroke-primary stroke-2 fill-none z-30 transition-colors duration-300"
          viewBox="0 0 100 115.47"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polygon
            points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Clipped Hex Content */}
        <div
          className="absolute inset-0 overflow-hidden bg-surface transition-all duration-300"
          style={{
            clipPath: HEX_CLIP_PATH,
            viewTransitionName: `project-hero-${nextProject.slug}`,
          }}
        >
          {/* Cover Media */}
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={nextProject.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface font-mono text-xs text-muted-foreground uppercase">
              {nextProject.title}
            </div>
          )}

          {/* Dimmer Overlay */}
          <div className="absolute inset-0 bg-background/70 group-hover:bg-background/50 transition-colors duration-300" />

          {/* Cell Typography */}
          <div className="relative z-20 flex h-full w-full flex-col items-center justify-between p-4 text-center">
            <span className="font-mono text-[9px] uppercase tracking-widest text-primary bg-background/90 px-2 py-0.5 border border-border">
              {nextProject.category.replace("_", " ")}
            </span>

            <div className="flex flex-col items-center px-2">
              <h4 className="font-black text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {nextProject.title}
              </h4>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5 line-clamp-1">
                {nextProject.role}
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-primary font-bold">
              <span>View Case Study</span>
              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
