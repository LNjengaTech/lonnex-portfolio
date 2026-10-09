"use client";

import { useEffect, useState } from "react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleTocProps {
  items: TocItem[];
}

export function ArticleToc({ items }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const activeIndex = items.findIndex((i) => i.id === activeId);

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-4 select-none scrollbar-none"
    >
      <div className="flex items-center gap-2 mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        Contents
      </div>

      <div className="relative pl-6 space-y-4">
        {/* Continuous vertical connecting line */}
        <div
          className="absolute left-[7px] top-2 bottom-2 w-px bg-border -z-10"
          aria-hidden="true"
        />

        {items.map((item, index) => {
          const isActive = item.id === activeId;
          const isPast = activeIndex !== -1 && index <= activeIndex;

          return (
            <div key={item.id} className="relative group">
              {/* Connected Hex Node on the vertical line */}
              <div
                className={cn(
                  "absolute -left-6 top-1 w-3.5 h-4 transition-all duration-300",
                  isActive
                    ? "bg-primary scale-110 shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]"
                    : isPast
                    ? "bg-primary/60 scale-95"
                    : "bg-surface border border-border group-hover:border-primary/80"
                )}
                style={{ clipPath: HEX_CLIP_PATH }}
                aria-hidden="true"
              />

              {/* Heading link */}
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(item.id);
                  if (target) {
                    const top = target.getBoundingClientRect().top + window.scrollY - 90;
                    window.scrollTo({ top, behavior: "smooth" });
                    setActiveId(item.id);
                  }
                }}
                className={cn(
                  "block text-xs leading-snug transition-colors line-clamp-2",
                  item.level === 3 ? "pl-3 text-[11px]" : "font-medium",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.text}
              </a>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
