import { asc, desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { projects, studioItems, articles } from "@/lib/db/schema";

/**
 * Cached public reads used by the public site shell.
 * All reads are tag-based; admin mutations call revalidateTag() to bust these.
 */

export const getPublishedProjects = unstable_cache(
  async () => {
    try {
      return await db
        .select()
        .from(projects)
        .where(eq(projects.published, true))
        .orderBy(asc(projects.order), desc(projects.id));
    } catch {
      return [];
    }
  },
  ["public-projects"],
  { tags: ["projects"] }
);

export const getPublishedStudioCount = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select()
        .from(studioItems)
        .where(eq(studioItems.published, true));
      return rows.length;
    } catch {
      return 0;
    }
  },
  ["public-studio-count"],
  { tags: ["studio"] }
);

export const getPublishedArticleCount = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select()
        .from(articles)
        .where(eq(articles.status, "published"));
      return rows.length;
    } catch {
      return 0;
    }
  },
  ["public-article-count"],
  { tags: ["articles"] }
);

export const getLatestPublishedArticle = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select({ id: articles.id, title: articles.title, slug: articles.slug })
        .from(articles)
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.createdAt))
        .limit(1);
      return rows[0] ?? null;
    } catch {
      return null;
    }
  },
  ["public-latest-article"],
  { tags: ["articles"] }
);
