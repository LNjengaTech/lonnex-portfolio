import { asc, desc, eq, ne, inArray, and, lt, gt } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { articles, articleTags, tags, series } from "@/lib/db/schema";

// ── Tags ─────────────────────────────────────────────────────────────────────

export async function getAllTags() {
  try {
    return await db
      .select()
      .from(tags)
      .orderBy(asc(tags.name));
  } catch (err) {
    console.error("[getAllTags]", err);
    return [];
  }
}

export async function getTagById(id: number) {
  try {
    const rows = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error("[getTagById]", err);
    return null;
  }
}

// ── Series ────────────────────────────────────────────────────────────────────

export async function getAllSeries() {
  try {
    return await db
      .select()
      .from(series)
      .orderBy(asc(series.order), asc(series.title));
  } catch (err) {
    console.error("[getAllSeries]", err);
    return [];
  }
}

export async function getSeriesById(id: number) {
  try {
    const rows = await db.select().from(series).where(eq(series.id, id)).limit(1);
    return rows[0] ?? null;
  } catch (err) {
    console.error("[getSeriesById]", err);
    return null;
  }
}

// ── Articles (admin - all) ─────────────────────────────────────────────────────

export async function getArticlesList(includeUnpublished = true) {
  try {
    const list = includeUnpublished
      ? await db
          .select()
          .from(articles)
          .orderBy(desc(articles.createdAt))
      : await db
          .select()
          .from(articles)
          .where(eq(articles.status, "published"))
          .orderBy(desc(articles.createdAt));

    const allArticleTags = await db
      .select({
        articleId: articleTags.articleId,
        tagId: articleTags.tagId,
        tagName: tags.name,
        tagSlug: tags.slug,
      })
      .from(articleTags)
      .leftJoin(tags, eq(articleTags.tagId, tags.id));

    return list.map((a) => ({
      ...a,
      seo: a.seo as Record<string, string> | null,
      tags: allArticleTags
        .filter((t) => t.articleId === a.id)
        .map((t) => ({ id: t.tagId, name: t.tagName ?? "", slug: t.tagSlug ?? "" })),
    }));
  } catch (err) {
    console.error("[getArticlesList]", err);
    return [];
  }
}

export async function getArticleById(id: number) {
  try {
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .limit(1);

    if (!rows.length) return null;
    const article = rows[0];

    const tagRows = await db
      .select({ tagId: articleTags.tagId, name: tags.name, slug: tags.slug })
      .from(articleTags)
      .leftJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, id));

    return {
      ...article,
      seo: article.seo as Record<string, string> | null,
      tagIds: tagRows.map((t) => t.tagId),
      tags: tagRows.map((t) => ({ id: t.tagId, name: t.name ?? "", slug: t.slug ?? "" })),
    };
  } catch (err) {
    console.error("[getArticleById]", err);
    return null;
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1);
    if (!rows.length) return null;
    return getArticleById(rows[0].id);
  } catch (err) {
    console.error("[getArticleBySlug]", err);
    return null;
  }
}

// ── Public cached reads ───────────────────────────────────────────────────────

export const getPublishedArticles = unstable_cache(
  async () => {
    const list = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.createdAt));

    const allArticleTags = await db
      .select({
        articleId: articleTags.articleId,
        tagId: articleTags.tagId,
        tagName: tags.name,
        tagSlug: tags.slug,
      })
      .from(articleTags)
      .leftJoin(tags, eq(articleTags.tagId, tags.id));

    return list.map((a) => ({
      ...a,
      tags: allArticleTags
        .filter((t) => t.articleId === a.id)
        .map((t) => ({ id: t.tagId, name: t.tagName ?? "", slug: t.tagSlug ?? "" })),
    }));
  },
  ["articles-published"],
  { tags: ["articles"] }
);

export const getPublishedArticleBySlug = unstable_cache(
  async (slug: string) => {
    const rows = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
      .limit(1);
    if (!rows.length) return null;

    const article = rows[0];
    const tagRows = await db
      .select({ tagId: articleTags.tagId, name: tags.name, slug: tags.slug })
      .from(articleTags)
      .leftJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, article.id));

    // Series siblings for navigation
    let seriesArticles: Array<{ id: number; slug: string; title: string; seriesPart: number | null }> = [];
    if (article.seriesId) {
      seriesArticles = await db
        .select({ id: articles.id, slug: articles.slug, title: articles.title, seriesPart: articles.seriesPart })
        .from(articles)
        .where(and(eq(articles.seriesId, article.seriesId), eq(articles.status, "published")))
        .orderBy(asc(articles.seriesPart));
    }

    // Related articles by shared tags (up to 3, excluding self)
    const tagIds = tagRows.map((t) => t.tagId);
    const related: Array<{ id: number; slug: string; title: string; excerpt: string; readingTime: number }> = [];
    if (tagIds.length > 0) {
      const candidates = await db
        .selectDistinct({ id: articleTags.articleId })
        .from(articleTags)
        .where(
          and(
            inArray(articleTags.tagId, tagIds),
            ne(articleTags.articleId, article.id)
          )
        )
        .limit(5);

      for (const c of candidates) {
        const r = await db
          .select({ id: articles.id, slug: articles.slug, title: articles.title, excerpt: articles.excerpt, readingTime: articles.readingTime })
          .from(articles)
          .where(and(eq(articles.id, c.id), eq(articles.status, "published")))
          .limit(1);
        if (r[0]) related.push(r[0]);
        if (related.length >= 3) break;
      }
    }

    // Prev / Next in publication order
    const prevRow = await db
      .select({ id: articles.id, slug: articles.slug, title: articles.title })
      .from(articles)
      .where(and(eq(articles.status, "published"), lt(articles.createdAt, article.createdAt)))
      .orderBy(desc(articles.createdAt))
      .limit(1);

    const nextRow = await db
      .select({ id: articles.id, slug: articles.slug, title: articles.title })
      .from(articles)
      .where(and(eq(articles.status, "published"), gt(articles.createdAt, article.createdAt)))
      .orderBy(asc(articles.createdAt))
      .limit(1);

    return {
      ...article,
      tags: tagRows.map((t) => ({ id: t.tagId, name: t.name ?? "", slug: t.slug ?? "" })),
      seriesArticles,
      related,
      prev: prevRow[0] ?? null,
      next: nextRow[0] ?? null,
    };
  },
  ["article-by-slug"],
  { tags: ["articles"] }
);

// Public tag list (for filter UI)
export const getPublishedTags = unstable_cache(
  async () => {
    const rows = await db
      .selectDistinct({ id: tags.id, name: tags.name, slug: tags.slug })
      .from(tags)
      .innerJoin(articleTags, eq(articleTags.tagId, tags.id))
      .innerJoin(articles, and(eq(articles.id, articleTags.articleId), eq(articles.status, "published")))
      .orderBy(asc(tags.name));
    return rows;
  },
  ["tags-published"],
  { tags: ["articles"] }
);

// Public series list
export const getPublishedSeries = unstable_cache(
  async () => getAllSeries(),
  ["series-published"],
  { tags: ["articles"] }
);
