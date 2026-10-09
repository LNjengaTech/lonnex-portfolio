"use client";

import { X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkCategoryOption {
  id: string;
  label: string;
}

export const WORK_CATEGORIES: WorkCategoryOption[] = [
  { id: "all", label: "All Projects" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "systems", label: "Systems" },
  { id: "open_source", label: "Open Source" },
];

interface WorkFiltersProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  activeStack: string | null;
  onSelectStack: (stack: string | null) => void;
  availableStacks: string[];
  totalCount: number;
  matchingCount: number;
  className?: string;
}

export function WorkFilters({
  activeCategory,
  onSelectCategory,
  activeStack,
  onSelectStack,
  availableStacks,
  totalCount,
  matchingCount,
  className,
}: WorkFiltersProps) {
  const isFiltered = activeCategory !== "all" || activeStack !== null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Category Pills & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Pills */}
        <div
          role="tablist"
          aria-label="Filter projects by category"
          className="flex flex-wrap items-center gap-1.5"
        >
          {WORK_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectCategory(cat.id)}
                className={cn(
                  "font-mono text-xs uppercase tracking-wider px-3 py-1.5 transition-colors select-none",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                  isActive
                    ? "bg-primary text-primary-foreground font-bold"
                    : "bg-surface text-muted-foreground hover:text-foreground border border-border"
                )}
                style={{
                  clipPath:
                    "polygon(6px 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0 50%)",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Status / Matching Info */}
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {isFiltered ? (
            <>
              <span className="text-primary font-bold">{matchingCount} Active</span>
              <span>/</span>
              <span>{totalCount - matchingCount} Outline Wireframe</span>
              <button
                type="button"
                onClick={() => {
                  onSelectCategory("all");
                  onSelectStack(null);
                }}
                className="inline-flex items-center gap-1 ml-2 text-foreground hover:text-danger underline transition-colors"
                title="Reset active filters"
              >
                <X className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </>
          ) : (
            <span>{totalCount} Total Projects</span>
          )}
        </div>
      </div>

      {/* Dynamic Stack Tag Chips (if available) */}
      {availableStacks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex-shrink-0">
            <Filter className="h-3 w-3 text-primary" />
            <span>Tech:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-nowrap">
            {availableStacks.map((tag) => {
              const isSelected = activeStack === tag;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectStack(isSelected ? null : tag)}
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider px-2 py-1 transition-colors select-none flex-shrink-0",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold"
                      : "bg-surface/80 text-muted-foreground hover:text-foreground border border-border hover:border-primary/50"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
