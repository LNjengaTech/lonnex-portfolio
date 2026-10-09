import type { TocItem } from "@/components/site/article-toc";

export function extractTocAndEnrichHtml(rawHtml: string): {
  toc: TocItem[];
  enrichedHtml: string;
} {
  const toc: TocItem[] = [];
  let h2Count = 0;

  // Regex to match <h2> and <h3> tags and their contents
  const enrichedHtml = rawHtml.replace(
    /<h([23])([^>]*)>(.*?)<\/h\1>/gi,
    (match, levelStr, attrs, innerText) => {
      const level = parseInt(levelStr, 10);
      // Strip HTML tags from innerText for clean title
      const cleanText = innerText.replace(/<[^>]+>/g, "").trim();

      // Check if ID already exists in attrs
      const idMatch = attrs.match(/id=["']([^"']+)["']/i);
      let id = idMatch ? idMatch[1] : "";

      if (!id) {
        id = cleanText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        if (!id) {
          id = `heading-${toc.length + 1}`;
        }
      }

      // Add to TOC
      toc.push({
        id,
        text: cleanText,
        level,
      });

      // If H2, we can format with a hex index badge if desirable
      if (level === 2) {
        h2Count++;
        const numStr = String(h2Count).padStart(2, "0");
        // Rebuild with id and anchor
        return `<h2 id="${id}" class="group relative flex items-baseline gap-3"${attrs}><span class="text-xs font-mono text-primary/70 font-semibold select-none flex-shrink-0">${numStr}.</span><span>${innerText}</span></h2>`;
      }

      return `<h3 id="${id}"${attrs}>${innerText}</h3>`;
    }
  );

  return { toc, enrichedHtml };
}
