/**
 * Studio Wall Layout Engine
 *
 * Justified-rows algorithm that respects each item's true aspect ratio.
 * Portrait items (taller than wide) are separated into a "tall rail" on the left.
 * Landscape / square items are packed into justified rows that fill the container width.
 *
 * All computation uses stored width/height (from DB) — no layout shift on load.
 */

export interface StudioItemInput {
  id: number;
  title: string;
  mediaType: string;
  mediaUrl: string;
  cloudinaryId: string;
  width: number;
  height: number;
  ratio: string;
  specLabel: string;
  year: string;
  confidential: boolean;
  categoryId: number;
  collectionId: number | null;
  order: number;
  published: boolean;
}

export interface StudioLayoutItem extends StudioItemInput {
  layoutWidth: number;   // computed pixel width for this item
  layoutHeight: number;  // computed pixel height for this item
  isPortrait: boolean;   // aspect ratio height > width * 1.2
}

export interface StudioRow {
  items: StudioLayoutItem[];
  rowHeight: number;     // the shared height for all items in this row
}

export interface StudioLayout {
  tallRail: StudioLayoutItem[];   // portrait items: fixed height, true ratio
  rows: StudioRow[];              // landscape/square items packed in justified rows
  tallRailWidth: number;          // px width of the tall rail column (0 when on mobile)
  isMobile: boolean;              // containerWidth < MOBILE_BREAKPOINT
}

const MOBILE_BREAKPOINT = 768;     // below this, tall rail becomes horizontal rail
const PORTRAIT_THRESHOLD = 1.2;    // height/width > this → portrait (tall rail)

const DESKTOP_TARGET_ROW_HEIGHT = 300; // ideal row height for justified rows on desktop (px)
const DESKTOP_MIN_ROW_HEIGHT = 180;    // never let row height drop below this on desktop
const DESKTOP_MAX_ROW_HEIGHT = 480;    // never let row height exceed this on desktop
const DESKTOP_TALL_RAIL_HEIGHT = 480;  // fixed height for portrait items in rail on desktop

const MOBILE_TARGET_ROW_HEIGHT = 200;  // compact row height for mobile screens (px)
const MOBILE_MIN_ROW_HEIGHT = 140;     // minimum row height on mobile
const MOBILE_MAX_ROW_HEIGHT = 320;     // maximum row height on mobile
const MOBILE_TALL_RAIL_HEIGHT = 280;   // comfortable height for horizontal mobile rail

const GAP = 12; // gap between items (px)

/**
 * Build the Studio Wall layout from a list of items and a container width.
 *
 * @param items     published studio items to lay out
 * @param containerWidth  pixel width of the wall container
 */
export function buildStudioLayout(
  items: StudioItemInput[],
  containerWidth: number
): StudioLayout {
  const isMobile = containerWidth > 0 && containerWidth < MOBILE_BREAKPOINT;
  const portrait: StudioItemInput[] = [];
  const flat: StudioItemInput[] = [];

  for (const item of items) {
    const ar = item.width / item.height;
    if (ar < 1 / PORTRAIT_THRESHOLD) {
      portrait.push(item);
    } else {
      flat.push(item);
    }
  }

  const tallRailHeight = isMobile ? MOBILE_TALL_RAIL_HEIGHT : DESKTOP_TALL_RAIL_HEIGHT;

  // ── Tall Rail (portrait items) ──────────────────────────────────────────────
  const tallRail: StudioLayoutItem[] = portrait.map((item) => {
    const ar = item.width / item.height;
    const layoutHeight = tallRailHeight;
    const layoutWidth = Math.round(layoutHeight * ar);
    return { ...item, layoutWidth, layoutHeight, isPortrait: true };
  });

  // On desktop: widest portrait item sets the rail width; min 120px
  // On mobile: tall rail is rendered as a dedicated horizontal rail, so railWidth is 0
  const tallRailWidth =
    !isMobile && tallRail.length > 0
      ? Math.max(120, ...tallRail.map((i) => i.layoutWidth))
      : 0;

  // ── Justified Rows (landscape + square) ─────────────────────────────────────
  // Effective width available to flat items
  const effectiveWidth =
    tallRailWidth > 0
      ? containerWidth - tallRailWidth - GAP
      : containerWidth;

  const targetRowHeight = isMobile ? MOBILE_TARGET_ROW_HEIGHT : DESKTOP_TARGET_ROW_HEIGHT;
  const minRowHeight = isMobile ? MOBILE_MIN_ROW_HEIGHT : DESKTOP_MIN_ROW_HEIGHT;
  const maxRowHeight = isMobile ? MOBILE_MAX_ROW_HEIGHT : DESKTOP_MAX_ROW_HEIGHT;

  const rows = buildJustifiedRows(
    flat,
    effectiveWidth,
    targetRowHeight,
    minRowHeight,
    maxRowHeight
  );

  return { tallRail, rows, tallRailWidth, isMobile };
}

function buildJustifiedRows(
  items: StudioItemInput[],
  containerWidth: number,
  targetRowHeight: number = DESKTOP_TARGET_ROW_HEIGHT,
  minRowHeight: number = DESKTOP_MIN_ROW_HEIGHT,
  maxRowHeight: number = DESKTOP_MAX_ROW_HEIGHT
): StudioRow[] {
  if (items.length === 0 || containerWidth <= 0) return [];

  const rows: StudioRow[] = [];
  let rowStart = 0;

  while (rowStart < items.length) {
    // Greedily fill the row: keep adding items at targetRowHeight until
    // their total width exceeds containerWidth.
    let rowEnd = rowStart;
    let totalNaturalWidth = 0;

    while (rowEnd < items.length) {
      const item = items[rowEnd];
      const ar = item.width / item.height;
      const naturalW = targetRowHeight * ar;
      const nextTotal =
        totalNaturalWidth + naturalW + (rowEnd > rowStart ? GAP : 0);

      if (rowEnd > rowStart && nextTotal > containerWidth) break;
      totalNaturalWidth += naturalW + (rowEnd > rowStart ? GAP : 0);
      rowEnd++;
    }

    const rowItems = items.slice(rowStart, rowEnd);
    const gapsWidth = (rowItems.length - 1) * GAP;
    const availableForImages = containerWidth - gapsWidth;

    // Scale items so they fill the row width, maintaining each ratio
    const sumNatural = rowItems.reduce((sum, item) => {
      const ar = item.width / item.height;
      return sum + targetRowHeight * ar;
    }, 0);

    const scale = sumNatural > 0 ? availableForImages / sumNatural : 1;
    const rowHeight = Math.round(
      Math.min(maxRowHeight, Math.max(minRowHeight, targetRowHeight * scale))
    );

    const layoutItems: StudioLayoutItem[] = rowItems.map((item) => {
      const ar = item.width / item.height;
      const naturalW = targetRowHeight * ar;
      const layoutWidth = Math.round(
        (naturalW / sumNatural) * availableForImages
      );
      return { ...item, layoutWidth, layoutHeight: rowHeight, isPortrait: false };
    });

    rows.push({ items: layoutItems, rowHeight });
    rowStart = rowEnd;
  }

  return rows;
}
