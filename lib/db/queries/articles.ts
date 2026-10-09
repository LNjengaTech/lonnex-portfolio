import { asc, desc, eq, inArray, sql } from "drizzle-orm";
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
      .where(sql`${articles.slug} = ${slug} AND ${articles.status} = 'published'`)
      .limit(1);
    if (!rows.length) return null;

    const article = rows[0];
    const tagRows = await db
      .select({ tagId: articleTags.tagId, name: tags.name, slug: tags.slug })
      .from(articleTags)
      .leftJoin(tags, eq(articleTags.tagId, tags.id))
      .where(eq(articleTags.articleId, article.id));

    return {
      ...article,
      tags: tagRows.map((t) => ({ id: t.tagId, name: t.name ?? "", slug: t.slug ?? "" })),
    };
  },
  ["article-by-slug"],
  { tags: ["articles"] }
);
