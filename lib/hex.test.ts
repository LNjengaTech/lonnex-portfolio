import { describe, expect, it } from "vitest";
import {
  ALLOWED_HEX_ANGLES,
  HEX_ASPECT_RATIO,
  HEX_CLIP_PATH,
  calcHexHeight,
  calcHexWidth,
  isValidHexAngle,
  getHexNeighbors,
  getHexDistance,
  axialToPixel,
  pixelToAxial,
  getHexFootprintOffsets,
  packHoneycomb,
  type HexSize,
} from "./hex";

describe("hex geometry & math", () => {
  it("uses the correct aspect ratio and clip path", () => {
    expect(HEX_ASPECT_RATIO).toBeCloseTo(0.8660254, 5);
    expect(HEX_CLIP_PATH).toBe(
      "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)"
    );
  });

  it("calculates width from height accurately", () => {
    const height = 100;
    const width = calcHexWidth(height);
    expect(width).toBeCloseTo(86.603, 2);
  });

  it("calculates height from width accurately", () => {
    const width = 86.6025;
    const height = calcHexHeight(width);
    expect(height).toBeCloseTo(100, 1);
  });

  it("validates allowed angles strictly", () => {
    for (const angle of ALLOWED_HEX_ANGLES) {
      expect(isValidHexAngle(angle)).toBe(true);
    }
    expect(isValidHexAngle(45)).toBe(false);
    expect(isValidHexAngle(75)).toBe(false);
  });
});

describe("hex coordinates and neighbours", () => {
  it("returns exactly 6 distinct neighbours at distance 1", () => {
    const origin = { q: 0, r: 0 };
    const neighbors = getHexNeighbors(origin);
    expect(neighbors).toHaveLength(6);

    const neighborKeys = new Set(neighbors.map((n) => `${n.q},${n.r}`));
    expect(neighborKeys.size).toBe(6);

    for (const n of neighbors) {
      expect(getHexDistance(origin, n)).toBe(1);
    }
  });

  it("computes axial distance correctly", () => {
    expect(getHexDistance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0);
    expect(getHexDistance({ q: 0, r: 0 }, { q: 2, r: 0 })).toBe(2);
    expect(getHexDistance({ q: 1, r: -2 }, { q: -2, r: 2 })).toBe(4);
  });

  it("converts axial to pixel and back to axial", () => {
    const radius = 50;
    const testCoords = [
      { q: 0, r: 0 },
      { q: 1, r: 0 },
      { q: -1, r: 2 },
      { q: 3, r: -2 },
      { q: -4, r: -1 },
    ];

    for (const coord of testCoords) {
      const pixel = axialToPixel(coord, radius);
      const roundtrip = pixelToAxial(pixel, radius);
      expect(roundtrip.q).toBe(coord.q);
      expect(roundtrip.r).toBe(coord.r);
    }
  });
});

describe("hex footprints and honeycomb packer", () => {
  it("returns correct cell count per size tier", () => {
    expect(getHexFootprintOffsets(1)).toHaveLength(1); // 1 cell
    expect(getHexFootprintOffsets(2)).toHaveLength(7); // 1 + 6 = 7 cells
    expect(getHexFootprintOffsets(3)).toHaveLength(19); // 1 + 6 + 12 = 19 cells
  });

  it("packs mixed 1x, 2x, and 3x hexes with zero overlapping cells", () => {
    const items: Array<{ id: string; size: HexSize }> = [
      { id: "item-1", size: 3 },
      { id: "item-2", size: 2 },
      { id: "item-3", size: 1 },
      { id: "item-4", size: 2 },
      { id: "item-5", size: 1 },
      { id: "item-6", size: 1 },
      { id: "item-7", size: 3 },
    ];

    const placed = packHoneycomb(items, 50);
    expect(placed).toHaveLength(items.length);

    // Verify all occupied cells are strictly mutually exclusive
    const allCells = new Set<string>();
    let totalCellsExpected = 0;

    for (const p of placed) {
      totalCellsExpected += p.occupiedCells.length;
      for (const cell of p.occupiedCells) {
        const key = `${cell.q},${cell.r}`;
        expect(allCells.has(key)).toBe(false);
        allCells.add(key);
      }
    }

    expect(allCells.size).toBe(totalCellsExpected);
  });
});
