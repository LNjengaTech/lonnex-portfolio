import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { revalidateTag } from "@/lib/cache";

/**
 * POST /api/admin/journal/import
 *
 * Accepts a multipart form with a single `file` field.
 * Supported types: .md / .mdx (gray-matter) and .docx (mammoth).
 * Converts the content to Tiptap-compatible JSON and saves a draft article.
 */
export async function POST(req: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    let title = "Imported Article";
    let rawHtml = "";
    let tags: string[] = [];
    let publishedAt: string | null = null;

    if (filename.endsWith(".md") || filename.endsWith(".mdx")) {
      // ── Markdown import ──────────────────────────────────────────────────
      const matterModule = await import("gray-matter");
      const matter = matterModule.default || matterModule;
      const text = await file.text();
      const { data, content } = matter(text);

      title = String(data.title ?? filename.replace(/\.(mdx?)/i, ""));
      tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
      publishedAt = data.date ? String(data.date) : null;

      // Convert markdown to HTML using a simple regex-based converter
      // (We keep the dep count minimal; Tiptap will parse the HTML on the client)
      rawHtml = markdownToHtml(content);
    } else if (filename.endsWith(".docx")) {
      // ── DOCX import ───────────────────────────────────────────────────────
      const mammothModule = await import("mammoth");
      const mammoth = mammothModule.default || mammothModule;
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.convertToHtml({ buffer });
      rawHtml = result.value;
      title = filename.replace(/\.docx$/i, "").replace(/-/g, " ");
    } else {
      return NextResponse.json({ success: false, error: "Unsupported file type. Use .md, .mdx, or .docx." }, { status: 400 });
    }

    // Build a minimal Tiptap-compatible JSON doc
    const contentJson = htmlToTiptapDoc(rawHtml);

    // Derive slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100)
      + "-" + Date.now().toString(36);

    // Estimate word count for reading time
    const words = rawHtml.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const [created] = await db
      .insert(articles)
      .values({
        slug,
        title,
        excerpt: rawHtml.replace(/<[^>]+>/g, " ").slice(0, 200).trim(),
        contentJson,
        htmlCache: rawHtml,
        status: "draft",
        readingTime,
        publishAt: publishedAt ? new Date(publishedAt) : null,
      })
      .returning({ id: articles.id });

    revalidateTag("articles");

    return NextResponse.json({ success: true, id: created.id, title });
  } catch (err) {
    console.error("[import journal]", err);
    return NextResponse.json({ success: false, error: "Import failed." }, { status: 500 });
  }
}

// ── Lightweight Markdown → HTML ────────────────────────────────────────────────

function markdownToHtml(md: string): string {
  return md
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Code fences
    .replace(/```[\w]*\n([\s\S]*?)```/gm, "<pre><code>$1</code></pre>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Bold / italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Unordered list items (wrap individually, browser renders them)
    .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
    // Ordered list items
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Horizontal rule
    .replace(/^---$/gm, "<hr />")
    // Paragraphs (blank-line separated)
    .split(/\n\n+/)
    .map((block) => {
      const trimmed = block.trim();
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");
}

// ── HTML → minimal Tiptap JSON doc ────────────────────────────────────────────

function htmlToTiptapDoc(html: string): Record<string, unknown> {
  // A simple content list — Tiptap will re-parse this on the client via setContent.
  // We store it as a single "raw" html node by wrapping the entire HTML in a paragraph.
  // The editor will display the HTML via the htmlCache on first render when the
  // contentJson is being hydrated, and the user can edit from there.
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "[ Imported content — rendered from HTML cache below. Open the editor to finalise. ]",
          },
        ],
      },
    ],
    _importedHtml: html,
  };
}
