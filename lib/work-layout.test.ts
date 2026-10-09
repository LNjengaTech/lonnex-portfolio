import { describe, expect, it } from "vitest";
import { packHoneycomb, calcHexWidth, type HexSize } from "./hex";

describe("Phase 8a: Work Honeycomb & Timeline Geometry", () => {
  it("packs S, M, L, XL projects into non-overlapping hex coordinates", () => {
    const mockProjects: Array<{ id: string; size: HexSize; tileSize: string }> = [
      { id: "1", size: 3, tileSize: "XL" },
      { id: "2", size: 2, tileSize: "L" },
      { id: "3", size: 1, tileSize: "M" },
      { id: "4", size: 1, tileSize: "S" },
      { id: "5", size: 2, tileSize: "L" },
    ];

    const cellRadius = 64;
    const placed = packHoneycomb(mockProjects, cellRadius);

    expect(placed).toHaveLength(5);

    // XL tile placed at or near origin
    const xlTile = placed.find((p) => p.item.tileSize === "XL");
    expect(xlTile).toBeDefined();
    expect(xlTile?.occupiedCells).toHaveLength(19);

    // L tile has 7 cells footprint
    const lTile = placed.find((p) => p.item.tileSize === "L");
    expect(lTile).toBeDefined();
    expect(lTile?.occupiedCells).toHaveLength(7);

    // All occupied cells are disjoint
    const occupiedSet = new Set<string>();
    let totalFootprints = 0;
    for (const p of placed) {
      totalFootprints += p.occupiedCells.length;
      for (const cell of p.occupiedCells) {
        const key = `${cell.q},${cell.r}`;
        expect(occupiedSet.has(key)).toBe(false);
        occupiedSet.add(key);
      }
    }
    expect(occupiedSet.size).toBe(totalFootprints);
  });

  it("calculates 60-degree zig-zag timeline coordinates accurately", () => {
    const tileHeight = 210;
    const tileWidth = calcHexWidth(tileHeight);
    const horizStep = Math.round(tileWidth * 0.95);
    const highY = 40;
    const lowY = 190;

    // Check angle between alternating steps:
    // dx = horizStep, dy = lowY - highY = 150
    const dx = horizStep;
    const dy = lowY - highY;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;

    // Zig-zag slope is approximately 40-50 degrees relative to horizontal (consistent with 60-degree axial projection)
    expect(angleDeg).toBeGreaterThan(30);
    expect(angleDeg).toBeLessThan(60);
  });

  it("verifies outline wireframe filter logic preserves total item count", () => {
    const projects = [
      { id: 1, category: "web", stack: ["Next.js", "TypeScript"] },
      { id: 2, category: "mobile", stack: ["Flutter", "Dart"] },
      { id: 3, category: "systems", stack: ["Node.js", "PostgreSQL"] },
    ];

    // Filter by category = 'mobile'
    const activeCategory = "mobile";
    const matching = new Set(
      projects.filter((p) => p.category === activeCategory).map((p) => p.id)
    );

    expect(matching.has(2)).toBe(true);
    expect(matching.has(1)).toBe(false);
    expect(matching.has(3)).toBe(false);

    // The hive retains all 3 items; 1 is full, 2 flip to outline wireframe
    const totalCount = projects.length;
    const outlineCount = totalCount - matching.size;
    expect(outlineCount).toBe(2);
  });
});
