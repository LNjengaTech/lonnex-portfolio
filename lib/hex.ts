/**
 * Hexagon geometry constants, calculations, coordinate systems, and layout packing.
 * Pointy-top hexagons only.
 * Width = height * sqrt(3)/2 (~0.8660254)
 */

export const HEX_ASPECT_RATIO = Math.sqrt(3) / 2;

export const HEX_CLIP_PATH =
  "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)";

export const ALLOWED_HEX_ANGLES = [0, 30, 60, 90, 120] as const;
export type AllowedHexAngle = (typeof ALLOWED_HEX_ANGLES)[number];

export interface AxialCoord {
  q: number;
  r: number;
}

export interface PixelCoord {
  x: number;
  y: number;
}

export type HexSize = 1 | 2 | 3;

export const HEX_DIRECTIONS: readonly AxialCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
] as const;

export function calcHexWidth(height: number): number {
  return Math.round(height * HEX_ASPECT_RATIO * 1000) / 1000;
}

export function calcHexHeight(width: number): number {
  return Math.round((width / HEX_ASPECT_RATIO) * 1000) / 1000;
}

export function isValidHexAngle(angle: number): angle is AllowedHexAngle {
  return ALLOWED_HEX_ANGLES.includes(angle as AllowedHexAngle);
}

/**
 * Returns the 6 adjacent axial neighbours of a pointy-top hex.
 */
export function getHexNeighbors(coord: AxialCoord): AxialCoord[] {
  return HEX_DIRECTIONS.map((dir) => ({
    q: coord.q + dir.q,
    r: coord.r + dir.r,
  }));
}

/**
 * Calculates the hex grid distance between two axial coordinates.
 */
export function getHexDistance(a: AxialCoord, b: AxialCoord): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dq + dr) + Math.abs(dr)) / 2;
}

/**
 * Converts axial coordinates to pixel coordinates (center of the hex).
 * radius: circumradius (distance from center to vertex = height / 2).
 */
export function axialToPixel(coord: AxialCoord, radius: number): PixelCoord {
  const x = radius * Math.sqrt(3) * (coord.q + coord.r / 2);
  const y = radius * (3 / 2) * coord.r;
  return {
    x: Math.round(x * 100) / 100,
    y: Math.round(y * 100) / 100,
  };
}

/**
 * Converts pixel coordinates back to axial coordinates with cube rounding.
 */
export function pixelToAxial(pixel: PixelCoord, radius: number): AxialCoord {
  const q = ((Math.sqrt(3) / 3) * pixel.x - (1 / 3) * pixel.y) / radius;
  const r = ((2 / 3) * pixel.y) / radius;
  const s = -q - r;

  let roundQ = Math.round(q);
  let roundR = Math.round(r);
  let roundS = Math.round(s);

  const qDiff = Math.abs(roundQ - q);
  const rDiff = Math.abs(roundR - r);
  const sDiff = Math.abs(roundS - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    roundQ = -roundR - roundS;
  } else if (rDiff > sDiff) {
    roundR = -roundQ - roundS;
  }

  return { q: roundQ, r: roundR };
}

/**
 * Returns all axial offsets relative to the origin for a given hex size tier.
 * 1x: 1 cell (radius 0)
 * 2x: 7 cells (radius 1 ring)
 * 3x: 19 cells (radius 2 ring)
 */
export function getHexFootprintOffsets(size: HexSize): AxialCoord[] {
  const maxRadius = size - 1;
  const offsets: AxialCoord[] = [];

  for (let q = -maxRadius; q <= maxRadius; q++) {
    const r1 = Math.max(-maxRadius, -q - maxRadius);
    const r2 = Math.min(maxRadius, -q + maxRadius);
    for (let r = r1; r <= r2; r++) {
      offsets.push({ q, r });
    }
  }

  return offsets;
}

export interface PlacedHexItem<T> {
  item: T;
  coord: AxialCoord;
  pixel: PixelCoord;
  size: HexSize;
  occupiedCells: AxialCoord[];
}

/**
 * Honeycomb packer: packs items with sizes 1x, 2x, or 3x into a compact,
 * non-overlapping axial honeycomb grid starting from the origin.
 */
export function packHoneycomb<T extends { id: string; size: HexSize }>(
  items: T[],
  cellRadius: number = 60
): PlacedHexItem<T>[] {
  const occupiedKeys = new Set<string>();
  const placed: PlacedHexItem<T>[] = [];

  const keyFor = (q: number, r: number) => `${q},${r}`;

  // Spiral search candidates sorted by distance from origin
  function getCandidateCoords(maxRing: number): AxialCoord[] {
    const candidates: AxialCoord[] = [{ q: 0, r: 0 }];
    for (let ring = 1; ring <= maxRing; ring++) {
      let q = -ring;
      let r = ring;
      for (let i = 0; i < 6; i++) {
        const dir = HEX_DIRECTIONS[i];
        for (let step = 0; step < ring; step++) {
          candidates.push({ q, r });
          q += dir.q;
          r += dir.r;
        }
      }
    }
    return candidates;
  }

  // Precompute candidate coords up to ring 20
  const candidates = getCandidateCoords(20);

  for (const item of items) {
    const footprint = getHexFootprintOffsets(item.size);
    let chosenCoord: AxialCoord | null = null;
    let chosenOccupied: AxialCoord[] = [];

    for (const candidate of candidates) {
      let canPlace = true;
      const candidateOccupied: AxialCoord[] = [];

      for (const offset of footprint) {
        const targetQ = candidate.q + offset.q;
        const targetR = candidate.r + offset.r;
        const k = keyFor(targetQ, targetR);
        if (occupiedKeys.has(k)) {
          canPlace = false;
          break;
        }
        candidateOccupied.push({ q: targetQ, r: targetR });
      }

      if (canPlace) {
        chosenCoord = candidate;
        chosenOccupied = candidateOccupied;
        break;
      }
    }

    if (!chosenCoord) {
      // Fallback: place beyond current candidates
      chosenCoord = { q: placed.length * 3, r: 0 };
      chosenOccupied = footprint.map((offset) => ({
        q: chosenCoord!.q + offset.q,
        r: chosenCoord!.r + offset.r,
      }));
    }

    // Mark cells occupied
    for (const cell of chosenOccupied) {
      occupiedKeys.add(keyFor(cell.q, cell.r));
    }

    placed.push({
      item,
      coord: chosenCoord,
      pixel: axialToPixel(chosenCoord, cellRadius),
      size: item.size,
      occupiedCells: chosenOccupied,
    });
  }

  return placed;
}
