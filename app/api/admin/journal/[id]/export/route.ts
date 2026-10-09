import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getArticleById } from "@/lib/db/queries/articles";

/**
 * GET /api/admin/journal/[id]/export
 * Returns the article as a Markdown file download.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const article = await getArticleById(Number(id));

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Build front matter
  const tagNames = (article.tags ?? []).map((t) => `"${t.name}"`).join(", ");
  const frontMatter = [
    "---",
    `title: "${article.title}"`,
    `slug: "${article.slug}"`,
    `excerpt: "${article.excerpt}"`,
    `status: ${article.status}`,
    `readingTime: ${article.readingTime}`,
    article.publishAt ? `date: "${article.publishAt.toISOString()}"` : null,
    tagNames ? `tags: [${tagNames}]` : null,
    "---",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  // Use the cached HTML to produce the Markdown body (simple conversion)
  const body = article.htmlCache
    ? htmlToMarkdown(article.htmlCache)
    : "<!-- content not available — open in editor to restore -->";

  const markdown = frontMatter + body;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${article.slug}.md"`,
    },
  });
}

// ── Lightweight HTML → Markdown ───────────────────────────────────────────────

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, inner) =>
      inner
        .trim()
        .split("\n")
        .map((l: string) => `> ${l}`)
        .join("\n") + "\n\n"
    )
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<\/?[uo]l[^>]*>/gi, "\n")
    .replace(/<hr[^>]*\/?>/gi, "\n---\n\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
