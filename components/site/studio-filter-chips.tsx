"use client";

import { cn } from "@/lib/utils";

interface StudioFilterChipsProps {
  categories: { id: number; name: string }[];
  selected: number | null;
  onChange: (id: number | null) => void;
}

export function StudioFilterChips({
  categories,
  selected,
  onChange,
}: StudioFilterChipsProps) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {/* "All" chip */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          "relative inline-flex items-center justify-center px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 border",
          selected === null
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground"
        )}
        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={cn(
            "relative inline-flex items-center justify-center px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 flex-shrink-0 border",
            selected === cat.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
