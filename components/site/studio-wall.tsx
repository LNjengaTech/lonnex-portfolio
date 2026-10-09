"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChamferFrame } from "@/components/hex/chamfer-frame";
import { CloudImage } from "@/components/site/cloud-image";
import { CloudVideo } from "@/components/site/cloud-video";
import { StudioLightbox } from "@/components/site/studio-lightbox";
import { StudioCollectionPile } from "@/components/site/studio-collection-pile";
import { StudioFilterChips } from "@/components/site/studio-filter-chips";
import { buildStudioLayout } from "@/lib/studio-layout";
import type { StudioItemInput, StudioLayoutItem } from "@/lib/studio-layout";
import { cn } from "@/lib/utils";
import { Lock, Play } from "lucide-react";

interface StudioWallProps {
  items: StudioItemInput[];
  categories: { id: number; name: string }[];
  collections: { id: number; title: string }[];
}

const GAP = 12; // must match lib/studio-layout.ts

// Maximum number of videos allowed to play simultaneously
const MAX_SIMULTANEOUS_VIDEOS = 2;

export function StudioWall({ items, categories, collections }: StudioWallProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [lightboxItems, setLightboxItems] = useState<StudioLayoutItem[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(960);
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width for layout engine
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Filtered items
  const filteredItems = useMemo(
    () =>
      selectedCategory === null
        ? items
        : items.filter((i) => i.categoryId === selectedCategory),
    [items, selectedCategory]
  );

  // Layout engine
  const layout = useMemo(
    () => buildStudioLayout(filteredItems, containerWidth),
    [filteredItems, containerWidth]
  );

  // All layout items (flat list for lightbox indexing)
  const allLayoutItems = useMemo((): StudioLayoutItem[] => {
    const railItems = layout.tallRail;
    const rowItems = layout.rows.flatMap((r) => r.items);
    return [...railItems, ...rowItems];
  }, [layout]);

  const openLightbox = useCallback((item: StudioLayoutItem, pool?: StudioLayoutItem[]) => {
    const pool_ = pool ?? allLayoutItems;
    const idx = pool_.findIndex((i) => i.id === item.id);
    setLightboxItems(pool_);
    setLightboxIndex(idx >= 0 ? idx : 0);
  }, [allLayoutItems]);

  const closeLightbox = useCallback(() => setLightboxItems(null), []);

  const registerVideoPlay = useCallback((id: number) => {
    setPlayingVideos((prev) => {
      if (prev.has(id)) return prev;
      if (prev.size >= MAX_SIMULTANEOUS_VIDEOS) return prev; // cap
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const unregisterVideoPlay = useCallback((id: number) => {
    setPlayingVideos((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Group items by collectionId for pile rendering
  const collectionGroups = useMemo(() => {
    const map = new Map<number, StudioLayoutItem[]>();
    for (const item of allLayoutItems) {
      if (item.collectionId) {
        const arr = map.get(item.collectionId) ?? [];
        arr.push(item);
        map.set(item.collectionId, arr);
      }
    }
    return map;
  }, [allLayoutItems]);

  // Set of item IDs that are part of a collection (shown via pile, not individually)
  const collectionItemIds = useMemo(() => {
    const ids = new Set<number>();
    collectionGroups.forEach((items) => {
      // Only render as pile if collection has >1 item
      if (items.length > 1) items.forEach((i) => ids.add(i.id));
    });
    return ids;
  }, [collectionGroups]);

  // Collections that have been "placed" in the current layout
  const placedCollectionIds = useRef(new Set<number>());

  return (
    <div>
      <StudioFilterChips
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />

      <div ref={containerRef} className="relative w-full">
        {containerWidth === 0 ? null : layout.isMobile ? (
          /* ── MOBILE LAYOUT: Horizontal rail for tall items + Full-width rows ── */
          <div className="flex flex-col gap-6 w-full">
            {/* 1. Tall Rail (Rollups & Posters) as swipeable horizontal carousel */}
            {layout.tallRail.length > 0 && (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Rollups & Posters
                  </span>
                  <span className="text-[10px] text-muted-foreground">Swipe →</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
                  {layout.tallRail.map((item) => (
                    <div key={item.id} className="snap-start flex-shrink-0">
                      <StudioItem
                        item={item}
                        canPlay={playingVideos.size < MAX_SIMULTANEOUS_VIDEOS || playingVideos.has(item.id)}
                        onPlay={() => registerVideoPlay(item.id)}
                        onPause={() => unregisterVideoPlay(item.id)}
                        onClick={() => openLightbox(item, layout.tallRail)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Justified Rows occupying 100% mobile width */}
            <div className="flex flex-col gap-3 w-full">
              {(() => {
                placedCollectionIds.current = new Set<number>();
                return layout.rows.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-3 items-start w-full">
                    {row.items.map((item) => {
                      if (collectionItemIds.has(item.id) && item.collectionId) {
                        const colId = item.collectionId;
                        if (placedCollectionIds.current.has(colId)) return null;
                        placedCollectionIds.current.add(colId);
                        const colItems = collectionGroups.get(colId) ?? [];
                        const colInfo = collections.find((c) => c.id === colId);
                        return (
                          <StudioCollectionPile
                            key={`col-${colId}`}
                            items={colItems}
                            collectionTitle={colInfo?.title ?? "Collection"}
                            onItemClick={(i) => openLightbox(i, colItems)}
                          />
                        );
                      }

                      return (
                        <StudioItem
                          key={item.id}
                          item={item}
                          canPlay={playingVideos.size < MAX_SIMULTANEOUS_VIDEOS || playingVideos.has(item.id)}
                          onPlay={() => registerVideoPlay(item.id)}
                          onPause={() => unregisterVideoPlay(item.id)}
                          onClick={() => openLightbox(item)}
                        />
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>
        ) : (
          /* ── DESKTOP LAYOUT: Side-by-side rail & rows ── */
          <div className="flex gap-3 items-start">
            {/* ── Tall Rail (portrait items) ────────────────────── */}
            {layout.tallRail.length > 0 && (
              <div
                className="flex-shrink-0 flex flex-col gap-3"
                style={{ width: layout.tallRailWidth }}
              >
                {layout.tallRail.map((item) => (
                  <StudioItem
                    key={item.id}
                    item={item}
                    canPlay={playingVideos.size < MAX_SIMULTANEOUS_VIDEOS || playingVideos.has(item.id)}
                    onPlay={() => registerVideoPlay(item.id)}
                    onPause={() => unregisterVideoPlay(item.id)}
                    onClick={() => openLightbox(item, layout.tallRail)}
                  />
                ))}
              </div>
            )}

            {/* ── Justified Rows ────────────────────────────────── */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
              {(() => {
                placedCollectionIds.current = new Set<number>();
                return layout.rows.map((row, rowIdx) => (
                  <div key={rowIdx} className="flex gap-3 items-start">
                    {row.items.map((item) => {
                      // If this item belongs to a multi-item collection...
                      if (collectionItemIds.has(item.id) && item.collectionId) {
                        const colId = item.collectionId;
                        // Render the pile only once (at the first item's position)
                        if (placedCollectionIds.current.has(colId)) return null;
                        placedCollectionIds.current.add(colId);
                        const colItems = collectionGroups.get(colId) ?? [];
                        const colInfo = collections.find((c) => c.id === colId);
                        return (
                          <StudioCollectionPile
                            key={`col-${colId}`}
                            items={colItems}
                            collectionTitle={colInfo?.title ?? "Collection"}
                            onItemClick={(i) => openLightbox(i, colItems)}
                          />
                        );
                      }

                      return (
                        <StudioItem
                          key={item.id}
                          item={item}
                          canPlay={playingVideos.size < MAX_SIMULTANEOUS_VIDEOS || playingVideos.has(item.id)}
                          onPlay={() => registerVideoPlay(item.id)}
                          onPause={() => unregisterVideoPlay(item.id)}
                          onClick={() => openLightbox(item)}
                        />
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxItems && (
        <StudioLightbox
          items={lightboxItems}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
        />
      )}
    </div>
  );
}

// ── Individual Item ──────────────────────────────────────────────────────────

interface StudioItemProps {
  item: StudioLayoutItem;
  canPlay: boolean;
  onPlay: () => void;
  onPause: () => void;
  onClick: () => void;
}

function StudioItem({ item, canPlay, onPlay, onPause, onClick }: StudioItemProps) {
  const [hovered, setHovered] = useState(false);
  const isVideo = item.mediaType === "video";

  return (
    <button
      onClick={item.confidential ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative group focus:outline-none flex-shrink-0 text-left",
        item.confidential ? "cursor-not-allowed" : "cursor-pointer"
      )}
      style={{ width: item.layoutWidth, height: item.layoutHeight }}
      aria-label={item.title}
    >
      <ChamferFrame
        className={cn(
          "overflow-hidden w-full h-full transition-all duration-300",
          hovered && !item.confidential ? "brightness-105" : ""
        )}
        style={{ width: item.layoutWidth, height: item.layoutHeight }}
      >
        {item.confidential ? (
          <div className="w-full h-full bg-surface flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Lock className="w-8 h-8 opacity-30" />
            <span className="text-[10px] uppercase tracking-wider opacity-60">NDA</span>
          </div>
        ) : isVideo ? (
          <CloudVideo
            publicId={item.cloudinaryId}
            width={item.layoutWidth}
            height={item.layoutHeight}
            label={item.title}
            autoPlay={hovered && canPlay}
            muted
            loop
            className="w-full h-full object-cover"
          />
        ) : (
          <CloudImage
            publicId={item.cloudinaryId}
            alt={item.title}
            width={item.layoutWidth}
            height={item.layoutHeight}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}

        {/* Hover / Touch overlay with spec label */}
        {!item.confidential && (
          <div
            className={cn(
              "absolute inset-0 flex flex-col justify-end p-2 sm:p-3 bg-gradient-to-t from-background/90 via-background/40 to-transparent",
              "transition-opacity duration-200 pointer-events-none",
              hovered ? "opacity-100" : "opacity-90 sm:opacity-0"
            )}
          >
            <p className="text-[11px] sm:text-xs font-semibold text-foreground leading-tight line-clamp-1">
              {item.title}
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
              {item.specLabel} · {item.year}
            </p>
          </div>
        )}

        {/* Video play indicator */}
        {isVideo && !hovered && !item.confidential && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background/60 backdrop-blur-sm rounded-full p-2">
              <Play className="w-5 h-5 text-foreground" />
            </div>
          </div>
        )}
      </ChamferFrame>
    </button>
  );
}
