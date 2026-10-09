import type { Metadata } from "next";
import Link from "next/link";
import { Rss } from "lucide-react";
import { getPublishedArticles, getPublishedTags } from "@/lib/db/queries/articles";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { JournalFilterList } from "@/components/site/journal-filter-list";

export const revalidate = 3600; // 1h ISR fallback, on-demand revalidation via 'articles' tag

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteTitle = settings?.siteTitle || "Lonnex Njenga";

  return {
    title: `Journal — Essays & Architecture Notes | ${siteTitle}`,
    description:
      "Technical essays on hexagonal geometry, full-stack architecture, spatial interfaces, and commercial digital craftsmanship by Lonnex Njenga.",
    alternates: {
      types: {
        "application/rss+xml": "/rss.xml",
      },
    },
  };
}

export default async function JournalPage() {
  const [articles, tags] = await Promise.all([
    getPublishedArticles(),
    getPublishedTags(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      {/* ── Journal Header ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pt-16 sm:pt-20 pb-8 md:pt-28 md:pb-12 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-3">
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-primary font-semibold">
              The Archive · Essays & Notes
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-none">
              Journal
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Writing on spatial systems, axial geometry, reactive full-stack architecture, and the intersection of code and visual craftsmanship.
            </p>
          </div>

          {/* RSS Link */}
          <Link
            href="/rss.xml"
            target="_blank"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground transition-colors self-start sm:self-auto"
            title="Subscribe via RSS"
          >
            <Rss className="w-3.5 h-3.5 text-primary" />
            <span>RSS Feed</span>
          </Link>
        </div>
      </section>

      {/* ── Articles List & Filters ─────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
        <JournalFilterList articles={articles} tags={tags} />
      </section>
    </main>
  );
}
