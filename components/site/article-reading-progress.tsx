"use client";

import { useEffect, useState } from "react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

interface ArticleReadingProgressProps {
  readingTime: number;
}

export function ArticleReadingProgress({ readingTime }: ArticleReadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      const pct = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      setProgress(pct);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 6 hex segments: segment index 0..5
  const activeSegments = Math.min(6, Math.floor((progress / 100) * 6) + (progress > 5 ? 1 : 0));

  return (
    <div
      className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/80 px-4 py-2 transition-all"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 text-xs font-mono">
        {/* Estimated time remaining or read progress */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider">Reading</span>
          <span className="text-foreground font-semibold">{Math.round(progress)}%</span>
          <span className="hidden sm:inline text-muted-foreground/60">·</span>
          <span className="hidden sm:inline text-muted-foreground">
            {readingTime} min read
          </span>
        </div>

        {/* 6 Hex segments */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => {
            const isFilled = i < activeSegments;
            return (
              <div
                key={i}
                className={cn(
                  "w-3 h-3.5 transition-all duration-300",
                  isFilled
                    ? "bg-primary scale-100 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                    : "bg-surface border border-border/80 scale-90 opacity-40"
                )}
                style={{ clipPath: HEX_CLIP_PATH }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
