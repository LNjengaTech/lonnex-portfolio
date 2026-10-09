"use client";

import * as React from "react";
import { WorkViewToggle, type WorkViewMode } from "@/components/site/work-view-toggle";
import { WorkFilters } from "@/components/site/work-filters";
import { WorkHiveView } from "@/components/site/work-hive-view";
import { WorkIndexView } from "@/components/site/work-index-view";
import { WorkTimelineView } from "@/components/site/work-timeline-view";
import type { PublicProjectItem } from "@/lib/db/queries/projects";

interface WorkPageClientProps {
  projects: PublicProjectItem[];
  title?: string;
  description?: string;
}

export function WorkPageClient({
  projects,
  title = "The Honeycomb Wall",
  description = "Code projects and engineering systems, packed by importance in a hexagonal mosaic.",
}: WorkPageClientProps) {
  const [viewMode, setViewMode] = React.useState<WorkViewMode>("hive");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [activeStack, setActiveStack] = React.useState<string | null>(null);

  // Extract all unique stack tags across projects
  const availableStacks = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) {
      if (Array.isArray(p.stack)) {
        for (const s of p.stack) {
          if (s.trim()) set.add(s.trim());
        }
      }
    }
    return Array.from(set).sort();
  }, [projects]);

  // Compute matching project IDs based on category and stack filters
  const matchingProjectIds = React.useMemo(() => {
    const ids = new Set<number>();

    for (const p of projects) {
      const matchCategory =
        activeCategory === "all" || p.category === activeCategory;

      const matchStack =
        activeStack === null ||
        (Array.isArray(p.stack) && p.stack.includes(activeStack));

      if (matchCategory && matchStack) {
        ids.add(p.id);
      }
    }

    return ids;
  }, [projects, activeCategory, activeStack]);

  return (
    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ── Header: Title, Description & View Mode Toggle ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary font-bold">
              01 // WORK
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              · {projects.length} Projects
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
            {title}
          </h1>

          <p className="font-mono text-xs sm:text-sm text-muted-foreground uppercase tracking-wider leading-relaxed">
            {description}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex-shrink-0">
          <WorkViewToggle viewMode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* ── Filters Bar: Categories & Tech Stack ── */}
      <div className="py-4 border-b border-border/60">
        <WorkFilters
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          activeStack={activeStack}
          onSelectStack={setActiveStack}
          availableStacks={availableStacks}
          totalCount={projects.length}
          matchingCount={matchingProjectIds.size}
        />
      </div>

      {/* ── Active View Mode ── */}
      <div className="mt-6 min-h-[500px]">
        {viewMode === "hive" && (
          <WorkHiveView
            projects={projects}
            matchingProjectIds={matchingProjectIds}
          />
        )}

        {viewMode === "index" && (
          <WorkIndexView
            projects={projects}
            matchingProjectIds={matchingProjectIds}
          />
        )}

        {viewMode === "timeline" && (
          <WorkTimelineView
            projects={projects}
            matchingProjectIds={matchingProjectIds}
          />
        )}
      </div>
    </div>
  );
}
