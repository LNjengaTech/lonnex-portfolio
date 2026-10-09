"use client";

import { useState } from "react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

interface Skill {
  id: number;
  name: string;
  tier: string; // "primary" | "secondary" | "familiar"
  years: number;
  icon: string;
}

interface SkillCategory {
  id: number;
  name: string;
  skills: Skill[];
}

interface SkillsHiveProps {
  categories: SkillCategory[];
}

export function SkillsHive({ categories }: SkillsHiveProps) {
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);

  const displayedCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories;

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border flex-shrink-0",
            activeCategory === null
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground"
          )}
          style={{ clipPath: HEX_CLIP_PATH }}
        >
          All Skills
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
            className={cn(
              "px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border flex-shrink-0",
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Legend & Hover Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted-foreground border-b border-border pb-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-3 bg-primary inline-block" style={{ clipPath: HEX_CLIP_PATH }} />
            Core / Primary
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-3 bg-primary/60 inline-block" style={{ clipPath: HEX_CLIP_PATH }} />
            Strong
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-3 bg-surface border border-border inline-block" style={{ clipPath: HEX_CLIP_PATH }} />
            Familiar
          </span>
        </div>

        {hoveredSkill && (
          <div className="text-foreground animate-fadeIn flex items-center gap-2">
            <span className="font-bold">{hoveredSkill.name}:</span>
            <span className="text-primary font-semibold capitalize">{hoveredSkill.tier}</span>
            <span>·</span>
            <span>{hoveredSkill.years} {hoveredSkill.years === 1 ? "year" : "years"} exp</span>
          </div>
        )}
      </div>

      {/* Skills Grouped by Category */}
      <div className="space-y-10">
        {displayedCategories.map((cat) => (
          <div key={cat.id} className="space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-primary flex items-center gap-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {cat.name}
            </h3>

            {/* Honeycomb Cluster for this Category */}
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
              {cat.skills.map((skill) => {
                const isPrimary = skill.tier === "primary";
                const isSecondary = skill.tier === "secondary";

                return (
                  <div
                    key={skill.id}
                    onMouseEnter={() => setHoveredSkill(skill)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    className="relative group cursor-pointer focus:outline-none"
                    tabIndex={0}
                  >
                    {/* Outer Hex */}
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center transition-all duration-300 p-2 text-center",
                        isPrimary
                          ? "w-24 h-28 sm:w-28 sm:h-32 bg-primary/10 border border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105"
                          : isSecondary
                          ? "w-20 h-24 sm:w-24 sm:h-28 bg-surface border border-primary/50 group-hover:border-primary group-hover:scale-105"
                          : "w-18 h-22 sm:w-20 sm:h-24 bg-surface border border-border group-hover:border-primary/60 group-hover:scale-105"
                      )}
                      style={{ clipPath: HEX_CLIP_PATH }}
                    >
                      <span className="text-xs sm:text-sm font-bold tracking-tight leading-tight line-clamp-2 px-1">
                        {skill.name}
                      </span>
                      <span className="text-[10px] font-mono opacity-70 mt-1">
                        {skill.years}y
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
