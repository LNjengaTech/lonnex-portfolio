import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeriesItem {
  id: number;
  slug: string;
  title: string;
  seriesPart: number | null;
}

interface ArticleSeriesNavProps {
  currentSlug: string;
  seriesTitle?: string;
  items: SeriesItem[];
}

export function ArticleSeriesNav({
  currentSlug,
  seriesTitle,
  items,
}: ArticleSeriesNavProps) {
  if (items.length <= 1) return null;

  const currentPart = items.findIndex((i) => i.slug === currentSlug) + 1;

  return (
    <div className="my-10 bg-surface border border-border p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary font-semibold">
          <Layers className="w-4 h-4" />
          <span>{seriesTitle ? `Series: ${seriesTitle}` : "Article Series"}</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          Part {currentPart} of {items.length}
        </span>
      </div>

      <div className="divide-y divide-border/60">
        {items.map((item, idx) => {
          const isCurrent = item.slug === currentSlug;
          const partNum = item.seriesPart || idx + 1;

          return (
            <div
              key={item.id}
              className={cn(
                "py-3 flex items-center justify-between gap-4 text-sm transition-colors",
                isCurrent ? "font-semibold text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    "text-xs font-mono px-2 py-0.5 border flex-shrink-0",
                    isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  Part {partNum}
                </span>

                {isCurrent ? (
                  <span className="truncate">{item.title}</span>
                ) : (
                  <Link href={`/journal/${item.slug}`} className="hover:underline truncate">
                    {item.title}
                  </Link>
                )}
              </div>

              {isCurrent ? (
                <span className="text-[10px] font-mono uppercase tracking-wider text-primary border border-primary/40 px-1.5 py-0.5 flex-shrink-0">
                  Current
                </span>
              ) : (
                <Link
                  href={`/journal/${item.slug}`}
                  className="text-xs text-muted-foreground hover:text-primary flex-shrink-0"
                  aria-label={`Read ${item.title}`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
