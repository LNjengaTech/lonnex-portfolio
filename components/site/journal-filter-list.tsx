"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Clock, Calendar, ArrowUpRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChamferFrame } from "@/components/hex/chamfer-frame";
import { HexEmptyState } from "@/components/hex/hex-empty-state";
import { HEX_CLIP_PATH } from "@/lib/hex";

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface ArticleItem {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  readingTime: number;
  createdAt: Date;
  tags: Tag[];
}

interface JournalFilterListProps {
  articles: ArticleItem[];
  tags: Tag[];
}

export function JournalFilterList({ articles, tags }: JournalFilterListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return articles.filter((art) => {
      const matchesTag = selectedTag
        ? art.tags.some((t) => t.slug === selectedTag)
        : true;
      const q = query.trim().toLowerCase();
      const matchesQuery = q
        ? art.title.toLowerCase().includes(q) ||
          art.excerpt.toLowerCase().includes(q) ||
          art.tags.some((t) => t.name.toLowerCase().includes(q))
        : true;
      return matchesTag && matchesQuery;
    });
  }, [articles, selectedTag, query]);

  // Featured article is the first article if no active filters
  const featuredArticle = !selectedTag && !query.trim() && articles.length > 0 ? articles[0] : null;
  const listArticles = featuredArticle ? filtered.filter((a) => a.id !== featuredArticle.id) : filtered;

  return (
    <div className="space-y-12">
      {/* ── Search & Filter Controls ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles by title, excerpt, tag..."
            className="w-full bg-surface border border-border pl-10 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tag Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedTag(null)}
            className={cn(
              "px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all border flex-shrink-0",
              selectedTag === null
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground"
            )}
            style={{ clipPath: HEX_CLIP_PATH }}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag === tag.slug ? null : tag.slug)}
              className={cn(
                "px-3 py-1 text-xs font-mono uppercase tracking-wider transition-all border flex-shrink-0",
                selectedTag === tag.slug
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-foreground"
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Featured Article (when not searching/filtering) ──────────────────── */}
      {featuredArticle && (
        <section aria-label="Featured article">
          <Link
            href={`/journal/${featuredArticle.slug}`}
            className="group block relative bg-surface border border-border hover:border-primary transition-all duration-300 p-6 sm:p-8 md:p-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Featured Essay
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {new Date(featuredArticle.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">
                  {featuredArticle.title}
                </h2>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-3">
                  {featuredArticle.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredArticle.readingTime} min read
                  </span>
                  <div className="flex items-center gap-1.5">
                    {featuredArticle.tags.map((t) => (
                      <span
                        key={t.id}
                        className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-background border border-border"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Oversized Hex Cover / Emblem */}
              <div className="lg:col-span-4 flex items-center justify-center">
                <div
                  className="relative w-44 h-48 sm:w-56 sm:h-60 bg-gradient-to-b from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30 transition-transform duration-500 group-hover:scale-105"
                  style={{ clipPath: HEX_CLIP_PATH }}
                >
                  <div className="text-center p-4">
                    <span className="text-4xl font-mono text-primary font-bold">⬡</span>
                    <span className="block mt-2 text-xs font-mono tracking-widest text-foreground font-semibold uppercase">
                      Read Essay
                    </span>
                    <ArrowUpRight className="w-4 h-4 mx-auto mt-1 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Typographic Article List ────────────────────────────────────────── */}
      <section aria-label="Articles list" className="space-y-4">
        {listArticles.length === 0 ? (
          <HexEmptyState
            title="No articles match criteria"
            message="No technical essays or notes match the active query or tag."
            action={
              (query || selectedTag) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedTag(null);
                  }}
                  className="font-mono text-xs uppercase tracking-wider text-primary hover:text-foreground underline underline-offset-4"
                >
                  Clear all filters
                </button>
              )
            }
          />
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {listArticles.map((art, idx) => {
              const displayIndex = String(idx + 1 + (featuredArticle ? 1 : 0)).padStart(2, "0");
              return (
                <Link
                  key={art.id}
                  href={`/journal/${art.slug}`}
                  className="group block py-6 sm:py-8 px-2 sm:px-4 hover:bg-surface transition-all duration-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
                    {/* Index Number */}
                    <div className="md:col-span-1">
                      <span className="text-sm font-mono text-muted-foreground group-hover:text-primary transition-colors">
                        {displayIndex}
                      </span>
                    </div>

                    {/* Main Info */}
                    <div className="md:col-span-7 space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors flex items-center justify-between gap-2">
                        <span>{art.title}</span>
                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-primary" />
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>

                    {/* Metadata & Tags */}
                    <div className="md:col-span-4 flex flex-row md:flex-col md:items-end justify-between gap-2 text-xs font-mono text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>
                          {new Date(art.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>·</span>
                        <span>{art.readingTime}m read</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {art.tags.map((t) => (
                          <span
                            key={t.id}
                            className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-background border border-border"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
