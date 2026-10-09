import { describe, expect, it } from "vitest";
import { extractTocAndEnrichHtml } from "./article-toc-extractor";

describe("Phase 8c: Article TOC and HTML Enrichment", () => {
  it("extracts H2 and H3 headings into table of contents", () => {
    const html = `
      <h2>1. The Geometry of Pointy-Top Hexagons</h2>
      <p>Intro paragraph text.</p>
      <h3>Axial Coordinates (q, r)</h3>
      <p>More details.</p>
      <h2>2. Honeycomb Packing Algorithm</h2>
      <p>Conclusion.</p>
    `;

    const { toc, enrichedHtml } = extractTocAndEnrichHtml(html);

    expect(toc).toHaveLength(3);
    expect(toc[0].text).toBe("1. The Geometry of Pointy-Top Hexagons");
    expect(toc[0].level).toBe(2);
    expect(toc[1].text).toBe("Axial Coordinates (q, r)");
    expect(toc[1].level).toBe(3);
    expect(toc[2].text).toBe("2. Honeycomb Packing Algorithm");
    expect(toc[2].level).toBe(2);
  });

  it("assigns slugified IDs to headings when not present", () => {
    const html = `<h2>Spatial Mathematics</h2>`;
    const { toc, enrichedHtml } = extractTocAndEnrichHtml(html);

    expect(toc[0].id).toBe("spatial-mathematics");
    expect(enrichedHtml).toContain('id="spatial-mathematics"');
  });

  it("preserves existing heading IDs if already defined", () => {
    const html = `<h2 id="custom-anchor">Pre-existing Anchor</h2>`;
    const { toc, enrichedHtml } = extractTocAndEnrichHtml(html);

    expect(toc[0].id).toBe("custom-anchor");
    expect(enrichedHtml).toContain('id="custom-anchor"');
  });

  it("handles empty HTML without error", () => {
    const { toc, enrichedHtml } = extractTocAndEnrichHtml("");
    expect(toc).toEqual([]);
    expect(enrichedHtml).toBe("");
  });
});
