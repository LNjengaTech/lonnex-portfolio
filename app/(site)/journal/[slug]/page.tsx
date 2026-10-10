import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag as TagIcon } from "lucide-react";
import { getPublishedArticleBySlug, getSeriesById } from "@/lib/db/queries/articles";
import { getProfile } from "@/lib/db/queries/profile";
import { getSiteSettings } from "@/lib/db/queries/settings";
import { extractTocAndEnrichHtml } from "@/lib/article-toc-extractor";
import { ArticleReadingProgress } from "@/components/site/article-reading-progress";
import { TextSizeProvider, TextSizeControls } from "@/components/site/article-text-size-controls";
import { ArticleToc } from "@/components/site/article-toc";
import { ArticleContent } from "@/components/site/article-content";
import { ArticleShareButtons } from "@/components/site/article-share-buttons";
import { ArticleAuthorCard } from "@/components/site/article-author-card";
import { ArticleSeriesNav } from "@/components/site/article-series-nav";
import { ArticleFooterNav } from "@/components/site/article-footer-nav";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);
  if (!article) return {};

  const [settings, profile] = await Promise.all([
    getSiteSettings(),
    getProfile(),
  ]);
  const siteTitle = settings?.siteTitle || "Lonnex Njenga";
  const authorName = profile?.name || "Lonnex Njenga";

  const seo = (article.seo as Record<string, string> | null) ?? {};
  const metaTitle = seo.title || `${article.title} | ${siteTitle}`;
  const metaDesc = seo.description || article.excerpt;

  // Prefer explicit OG image from SEO settings, fall back to cover
  const ogImage = seo.ogImageUrl || article.coverUrl || null;
  // Use scheduled publish time if set, otherwise creation date
  const publishedTime = article.publishAt
    ? new Date(article.publishAt).toISOString()
    : new Date(article.createdAt).toISOString();

  return {
    title: metaTitle,
    description: metaDesc,
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: "article",
      publishedTime,
      authors: [authorName],
      tags: article.tags.map((t) => t.name),
      section: seo.ogSection || undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: article.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublishedArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [profile, seriesInfo] = await Promise.all([
    getProfile(),
    article.seriesId ? getSeriesById(article.seriesId) : Promise.resolve(null),
  ]);

  // Extract headings from HTML and enrich with IDs for TOC
  const rawHtml = article.htmlCache || "";
  const { toc, enrichedHtml } = extractTocAndEnrichHtml(rawHtml);

  const formattedDate = new Date(article.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <TextSizeProvider>
      <div className="min-h-screen bg-background">
        {/* ── 6-Segment Hex Reading Progress Bar ───────────────────────────────── */}
        <ArticleReadingProgress readingTime={article.readingTime} />

        <main className="px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
          {/* ── Top Bar: Back Link & Text Size Controls ───────────────────────── */}
          <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12 border-b border-border/60 pb-4">
            <Link
              href="/journal"
              className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Journal</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] font-mono text-muted-foreground">Share:</span>
                <ArticleShareButtons title={article.title} slug={article.slug} compact />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-muted-foreground hidden sm:inline">
                  Text Size:
                </span>
                <TextSizeControls />
              </div>
            </div>
          </div>

          {/* ── Article Layout: TOC Sidebar + 68ch Center Reading Room ────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Sidebar: Hex-Chain TOC (Desktop) */}
            <aside className="hidden lg:block lg:col-span-3">
              <ArticleToc items={toc} />
            </aside>

            {/* Center Column: 68ch Reading Room */}
            <article className="lg:col-span-9 max-w-[68ch] mx-auto w-full">
              {/* Cover Hero Image */}
              {article.coverUrl && (
                <div className="relative w-full aspect-[2/1] overflow-hidden border border-border mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.coverUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Header Strip */}
              <header className="relative overflow-hidden space-y-4 mb-10 pb-8 border-b border-border">
                {/* Background geometric wireframe clusters with glowing dots */}
                <HexWireframeClusters
                  variant="all"
                  strokeWidth={0.65}
                  className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-35"
                />

                <div className="relative z-10 space-y-4">
                  {/* Series Badge (if part of series) */}
                  {seriesInfo && (
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-mono bg-primary/10 text-primary border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>
                        {seriesInfo.title} · Part {article.seriesPart || 1}
                      </span>
                    </div>
                  )}

                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                  {article.title}
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 pt-3 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <time dateTime={new Date(article.createdAt).toISOString()}>{formattedDate}</time>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{article.readingTime} min read</span>
                  </span>
                  {article.tags.length > 0 && (
                    <>
                      <span>·</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {article.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-surface border border-border"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </header>

              {/* Mobile Table of Contents (collapsible / compact) */}
              {toc.length > 0 && (
                <div className="block lg:hidden mb-10 p-4 bg-surface border border-border">
                  <ArticleToc items={toc} />
                </div>
              )}

              {/* Main Body with Drop Cap & Enhanced Blocks */}
              <ArticleContent html={enrichedHtml} />

              {/* Series Navigation (if part of multi-article series) */}
              {article.seriesArticles && article.seriesArticles.length > 1 && (
                <ArticleSeriesNav
                  currentSlug={article.slug}
                  seriesTitle={seriesInfo?.title}
                  items={article.seriesArticles}
                />
              )}

              {/* Share Buttons */}
              <div className="my-10 pt-6 border-t border-border flex items-center justify-between">
                <ArticleShareButtons title={article.title} slug={article.slug} />
              </div>

              {/* Author Card */}
              <div className="my-10">
                <ArticleAuthorCard profile={profile} />
              </div>

              {/* Previous / Next & Related Articles */}
              <ArticleFooterNav
                prev={article.prev}
                next={article.next}
                related={article.related}
              />
            </article>
          </div>
        </main>
      </div>
    </TextSizeProvider>
  );
}
