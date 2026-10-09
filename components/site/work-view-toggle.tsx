"use client";

import { LayoutGrid, ListFilter, GitCommit } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkViewMode = "hive" | "index" | "timeline";

interface WorkViewToggleProps {
  viewMode: WorkViewMode;
  onChange: (mode: WorkViewMode) => void;
  className?: string;
}

const VIEW_OPTIONS: Array<{
  id: WorkViewMode;
  label: string;
  icon: typeof LayoutGrid;
  description: string;
}> = [
  {
    id: "hive",
    label: "Hive",
    icon: LayoutGrid,
    description: "Honeycomb mosaic wall",
  },
  {
    id: "index",
    label: "Index",
    icon: ListFilter,
    description: "Typographic list with preview cursor",
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: GitCommit,
    description: "60° chronological zig-zag",
  },
];

export function WorkViewToggle({
  viewMode,
  onChange,
  className,
}: WorkViewToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Work presentation view mode"
      className={cn(
        "inline-flex items-center gap-1 bg-surface border border-border p-1 select-none",
        className
      )}
    >
      {VIEW_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = viewMode === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${opt.label} view: ${opt.description}`}
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors duration-200",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary",
              isActive
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            )}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
