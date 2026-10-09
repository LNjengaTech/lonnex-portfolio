"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles, articleTags, tags, series } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { revalidateTag } from "@/lib/cache";
import {
  articleSchema,
  tagSchema,
  seriesSchema,
  type ArticleInput,
  type TagInput,
  type SeriesInput,
} from "@/lib/validators/articles";

// ── helpers ───────────────────────────────────────────────────────────────────

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Estimate reading time in minutes (200 wpm). */
function estimateReadingTime(html: string) {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── Article actions ───────────────────────────────────────────────────────────

export async function createArticleAction(data: ArticleInput) {
  const user = await requireAuth();

  const validated = articleSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  const {
    slug,
    title,
    excerpt,
    coverUrl,
    contentJson,
    htmlCache,
    seriesId,
    seriesPart,
    status,
    publishAt,
    readingTime,
    seo,
    canonicalUrl,
    tagIds,
  } = validated.data;

  try {
    const [created] = await db
      .insert(articles)
      .values({
        slug,
        title,
        excerpt,
        coverUrl: coverUrl ?? null,
        contentJson,
        htmlCache: htmlCache ?? null,
        seriesId: seriesId ?? null,
        seriesPart: seriesPart ?? null,
        status,
        publishAt: publishAt ? new Date(publishAt) : null,
        readingTime,
        seo: seo ?? null,
        canonicalUrl: canonicalUrl || null,
      })
      .returning({ id: articles.id });

    if (tagIds.length) {
      await db.insert(articleTags).values(
        tagIds.map((tagId) => ({ articleId: created.id, tagId }))
      );
    }

    await logAudit({ action: "create", entityType: "article", entityId: String(created.id), userId: user.id });
    revalidateTag("articles");

    return { success: true, id: created.id };
  } catch (err) {
    console.error("[createArticleAction]", err);
    return { success: false, error: "Database error. Check the slug is unique." };
  }
}

export async function updateArticleAction(id: number, data: ArticleInput) {
  const user = await requireAuth();

  const validated = articleSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues.map((i) => i.message).join(", "),
    };
  }

  const {
    slug,
    title,
    excerpt,
    coverUrl,
    contentJson,
    htmlCache,
    seriesId,
    seriesPart,
    status,
    publishAt,
    readingTime,
    seo,
    canonicalUrl,
    tagIds,
  } = validated.data;

  try {
    await db
      .update(articles)
      .set({
        slug,
        title,
        excerpt,
        coverUrl: coverUrl ?? null,
        contentJson,
        htmlCache: htmlCache ?? null,
        seriesId: seriesId ?? null,
        seriesPart: seriesPart ?? null,
        status,
        publishAt: publishAt ? new Date(publishAt) : null,
        readingTime,
        seo: seo ?? null,
        canonicalUrl: canonicalUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id));

    // Replace tags
    await db.delete(articleTags).where(eq(articleTags.articleId, id));
    if (tagIds.length) {
      await db.insert(articleTags).values(
        tagIds.map((tagId) => ({ articleId: id, tagId }))
      );
    }

    await logAudit({ action: "update", entityType: "article", entityId: String(id), userId: user.id });
    revalidateTag("articles");

    return { success: true };
  } catch (err) {
    console.error("[updateArticleAction]", err);
    return { success: false, error: "Database error. Check the slug is unique." };
  }
}

export async function deleteArticleAction(id: number) {
  const user = await requireAuth();

  try {
    await db.delete(articleTags).where(eq(articleTags.articleId, id));
    await db.delete(articles).where(eq(articles.id, id));

    await logAudit({ action: "delete", entityType: "article", entityId: String(id), userId: user.id });
    revalidateTag("articles");

    return { success: true };
  } catch (err) {
    console.error("[deleteArticleAction]", err);
    return { success: false, error: "Failed to delete article." };
  }
}

// ── Tag actions ────────────────────────────────────────────────────────────────

export async function createTagAction(data: TagInput) {
  await requireAuth();

  const validated = tagSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    const [created] = await db
      .insert(tags)
      .values(validated.data)
      .returning({ id: tags.id });

    revalidateTag("articles");
    return { success: true, id: created.id };
  } catch {
    return { success: false, error: "Tag name or slug already exists." };
  }
}

export async function deleteTagAction(id: number) {
  await requireAuth();

  try {
    await db.delete(articleTags).where(eq(articleTags.tagId, id));
    await db.delete(tags).where(eq(tags.id, id));
    revalidateTag("articles");
    return { success: true };
  } catch (err) {
    console.error("[deleteTagAction]", err);
    return { success: false, error: "Failed to delete tag." };
  }
}

// ── Series actions ─────────────────────────────────────────────────────────────

export async function createSeriesAction(data: SeriesInput) {
  await requireAuth();

  const validated = seriesSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    const [created] = await db
      .insert(series)
      .values(validated.data)
      .returning({ id: series.id });

    revalidateTag("articles");
    return { success: true, id: created.id };
  } catch {
    return { success: false, error: "Series slug already exists." };
  }
}

export async function updateSeriesAction(id: number, data: SeriesInput) {
  await requireAuth();

  const validated = seriesSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.issues.map((i) => i.message).join(", ") };
  }

  try {
    await db
      .update(series)
      .set({ ...validated.data })
      .where(eq(series.id, id));

    revalidateTag("articles");
    return { success: true };
  } catch (err) {
    console.error("[updateSeriesAction]", err);
    return { success: false, error: "Failed to update series." };
  }
}

export async function deleteSeriesAction(id: number) {
  await requireAuth();

  try {
    // Unlink articles in this series
    await db.update(articles).set({ seriesId: null, seriesPart: null }).where(eq(articles.seriesId, id));
    await db.delete(series).where(eq(series.id, id));
    revalidateTag("articles");
    return { success: true };
  } catch (err) {
    console.error("[deleteSeriesAction]", err);
    return { success: false, error: "Failed to delete series." };
  }
}
