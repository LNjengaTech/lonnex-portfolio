import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

interface SiblingArticle {
  id: number;
  slug: string;
  title: string;
}

interface RelatedArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  readingTime: number;
}

interface ArticleFooterNavProps {
  prev: SiblingArticle | null;
  next: SiblingArticle | null;
  related: RelatedArticle[];
}

export function ArticleFooterNav({ prev, next, related }: ArticleFooterNavProps) {
  return (
    <div className="space-y-12 pt-8">
      {/* ── Previous / Next Navigation ──────────────────────────────────────── */}
      {(prev || next) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prev ? (
            <Link
              href={`/journal/${prev.slug}`}
              className="group block p-5 bg-surface border border-border hover:border-primary transition-colors text-left"
            >
              <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors mb-2">
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                Previous Article
              </span>
              <p className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
                {prev.title}
              </p>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}

          {next ? (
            <Link
              href={`/journal/${next.slug}`}
              className="group block p-5 bg-surface border border-border hover:border-primary transition-colors text-right"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors mb-2">
                Next Article
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <p className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
                {next.title}
              </p>
            </Link>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>
      )}

      {/* ── Related Articles ─────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section aria-label="Related articles" className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Related Essays
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/journal/${item.slug}`}
                className="group block p-5 bg-surface border border-border hover:border-primary transition-colors space-y-2"
              >
                <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{item.readingTime} min</span>
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
