import { requireAuth } from "@/lib/auth";
import { getArticlesList, getAllTags, getAllSeries } from "@/lib/db/queries/articles";
import { JournalListClient } from "./journal-list-client";

export default async function AdminJournalPage() {
  await requireAuth();

  const [articleRows, tagRows, seriesRows] = await Promise.all([
    getArticlesList(true),
    getAllTags(),
    getAllSeries(),
  ]);

  const articleList = articleRows.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    status: a.status as "draft" | "scheduled" | "published",
    readingTime: a.readingTime,
    publishAt: a.publishAt ? a.publishAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    tags: a.tags,
  }));

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Journal
        </h2>
        <p className="text-sm text-muted-foreground">
          Write, import, schedule and manage your tech articles and series.
        </p>
      </div>

      <JournalListClient
        initialArticles={articleList}
        initialTags={tagRows}
        initialSeries={seriesRows.map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description ?? null,
          order: s.order,
        }))}
      />
    </div>
  );
}
