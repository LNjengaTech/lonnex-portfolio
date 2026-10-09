import { describe, expect, it } from "vitest";
import { buildStudioLayout } from "./studio-layout";
import type { StudioItemInput } from "./studio-layout";

function makeItem(
  id: number,
  w: number,
  h: number,
  extra: Partial<StudioItemInput> = {}
): StudioItemInput {
  return {
    id,
    title: `Item ${id}`,
    mediaType: "image",
    mediaUrl: `https://example.com/${id}.jpg`,
    cloudinaryId: `placeholder/item-${id}`,
    width: w,
    height: h,
    ratio: `${w}:${h}`,
    specLabel: `Test / ${w}×${h}`,
    year: "2025",
    confidential: false,
    categoryId: 1,
    collectionId: null,
    order: id,
    published: true,
    ...extra,
  };
}

describe("Phase 8b: Studio layout engine", () => {
  it("separates portrait items into the tall rail", () => {
    const items: StudioItemInput[] = [
      makeItem(1, 400, 1200), // portrait (1:3)
      makeItem(2, 1920, 1080), // landscape (16:9)
      makeItem(3, 800, 800),  // square (1:1)
    ];

    const layout = buildStudioLayout(items, 1200);

    expect(layout.tallRail).toHaveLength(1);
    expect(layout.tallRail[0].id).toBe(1);
    expect(layout.tallRail[0].isPortrait).toBe(true);

    const flatIds = layout.rows.flatMap((r) => r.items.map((i) => i.id));
    expect(flatIds).toContain(2);
    expect(flatIds).toContain(3);
    expect(flatIds).not.toContain(1);
  });

  it("all landscape items have the same rowHeight within a row", () => {
    const items = [
      makeItem(1, 1600, 900),  // 16:9
      makeItem(2, 1200, 900),  // 4:3
      makeItem(3, 800, 600),   // 4:3
      makeItem(4, 1920, 1080), // 16:9
    ];

    const layout = buildStudioLayout(items, 1000);
    for (const row of layout.rows) {
      const heights = new Set(row.items.map((i) => i.layoutHeight));
      expect(heights.size).toBe(1);
    }
  });

  it("row widths sum to approximately the container width", () => {
    const items = [
      makeItem(1, 1600, 900),
      makeItem(2, 1200, 675),
      makeItem(3, 800, 600),
    ];

    const containerWidth = 900;
    const layout = buildStudioLayout(items, containerWidth);
    const GAP = 12;

    for (const row of layout.rows) {
      const totalW =
        row.items.reduce((sum, i) => sum + i.layoutWidth, 0) +
        (row.items.length - 1) * GAP;
      // Allow 5px tolerance for rounding
      expect(Math.abs(totalW - containerWidth)).toBeLessThan(5);
    }
  });

  it("portrait rail width is at least as wide as the widest portrait item", () => {
    const items = [
      makeItem(1, 600, 1800), // narrow portrait
      makeItem(2, 400, 1200), // very narrow portrait
      makeItem(3, 1200, 900), // landscape
    ];

    const layout = buildStudioLayout(items, 1200);

    expect(layout.tallRailWidth).toBeGreaterThanOrEqual(
      Math.max(...layout.tallRail.map((i) => i.layoutWidth))
    );
  });

  it("handles all-portrait or all-landscape correctly without crash", () => {
    const allPortrait = [makeItem(1, 400, 1200), makeItem(2, 500, 1500)];
    const allLandscape = [makeItem(3, 1600, 900), makeItem(4, 1920, 1080)];

    expect(() => buildStudioLayout(allPortrait, 1000)).not.toThrow();
    expect(() => buildStudioLayout(allLandscape, 1000)).not.toThrow();
    expect(() => buildStudioLayout([], 1000)).not.toThrow();
  });

  it("row heights respect MIN and MAX constraints", () => {
    const items = [
      // Very wide panoramic — would inflate row height above max
      makeItem(1, 5000, 400),
      // Very tall square — would shrink row height below min
      makeItem(2, 400, 400),
    ];

    const layout = buildStudioLayout(items, 1000);
    for (const row of layout.rows) {
      expect(row.rowHeight).toBeGreaterThanOrEqual(180);
      expect(row.rowHeight).toBeLessThanOrEqual(480);
    }
  });

  it("switches to mobile layout when containerWidth < 768", () => {
    const items = [
      makeItem(1, 400, 1200), // portrait
      makeItem(2, 1600, 900), // landscape
      makeItem(3, 800, 800),  // square
    ];

    const mobileLayout = buildStudioLayout(items, 375);
    expect(mobileLayout.isMobile).toBe(true);
    // On mobile, tallRailWidth is 0 so tall rail sits in a dedicated horizontal rail
    expect(mobileLayout.tallRailWidth).toBe(0);
    expect(mobileLayout.tallRail[0].layoutHeight).toBe(280);

    // Rows fill full mobile width
    for (const row of mobileLayout.rows) {
      const totalW =
        row.items.reduce((sum, i) => sum + i.layoutWidth, 0) +
        (row.items.length - 1) * 12;
      expect(Math.abs(totalW - 375)).toBeLessThan(5);
    }
  });
});
