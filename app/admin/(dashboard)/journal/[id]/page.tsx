import { requireAuth } from "@/lib/auth";
import { getArticleById, getAllTags, getAllSeries } from "@/lib/db/queries/articles";
import { JournalEditor } from "./journal-editor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Props) {
  await requireAuth();
  const { id } = await params;

  const [article, tagRows, seriesRows] = await Promise.all([
    getArticleById(Number(id)),
    getAllTags(),
    getAllSeries(),
  ]);

  if (!article) {
    return (
      <div className="py-20 text-center text-muted-foreground font-mono text-sm">
        Article not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Edit Article</h2>
          <p className="text-xs font-mono text-muted-foreground">{article.slug}</p>
        </div>
        <a
          href="/admin/journal"
          className="font-mono text-xs uppercase text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back
        </a>
      </div>

      <JournalEditor
        mode="edit"
        articleId={article.id}
        initialData={{
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          status: article.status as "draft" | "scheduled" | "published",
          readingTime: article.readingTime,
          publishAt: article.publishAt ? article.publishAt.toISOString() : null,
          tagIds: article.tagIds,
          coverUrl: article.coverUrl ?? null,
          contentJson: (article.contentJson as Record<string, unknown>) ?? {},
          seriesId: article.seriesId ?? null,
          seriesPart: article.seriesPart ?? null,
          seo: article.seo
            ? {
                title: (article.seo as Record<string, string>).title ?? null,
                description: (article.seo as Record<string, string>).description ?? null,
              }
            : null,
          canonicalUrl: article.canonicalUrl ?? null,
        }}
        allTags={tagRows}
        allSeries={seriesRows.map((s) => ({
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
