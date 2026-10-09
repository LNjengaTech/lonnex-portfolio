"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChamferFrame } from "@/components/hex/chamfer-frame";
import { CloudImage } from "@/components/site/cloud-image";
import type { StudioLayoutItem } from "@/lib/studio-layout";
import { Lock, Layers } from "lucide-react";

interface StudioCollectionPileProps {
  items: StudioLayoutItem[];
  collectionTitle: string;
  onItemClick: (item: StudioLayoutItem) => void;
}

/**
 * Renders a collection of items as a stacked, slightly-offset pile.
 * On click, the pile fans out to show all items.
 */
export function StudioCollectionPile({
  items,
  collectionTitle,
  onItemClick,
}: StudioCollectionPileProps) {
  const [fanned, setFanned] = useState(false);

  if (items.length === 0) return null;

  const top = items[0];
  const previewItems = items.slice(0, Math.min(3, items.length));

  if (!fanned) {
    return (
      <button
        onClick={() => setFanned(true)}
        className="relative group focus:outline-none max-w-full"
        aria-label={`${collectionTitle} — ${items.length} items (click to expand)`}
      >
        {/* Stacked offset layers */}
        {previewItems
          .slice()
          .reverse()
          .map((item, i) => {
            const real_i = previewItems.length - 1 - i;
            return (
              <div
                key={item.id}
                className="absolute inset-0 max-w-full"
                style={{
                  transform: `translate(${real_i * 4}px, ${real_i * -4}px)`,
                  zIndex: real_i,
                }}
              >
              <ChamferFrame
                  className="overflow-hidden max-w-full"
                  style={{ width: top.layoutWidth, height: top.layoutHeight, maxWidth: "100%" }}
                >
                  {item.confidential ? (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground opacity-40" />
                    </div>
                  ) : (
                    <CloudImage
                      publicId={item.cloudinaryId}
                      alt={item.title}
                      width={item.layoutWidth}
                      height={item.layoutHeight}
                      className="object-cover w-full h-full"
                    />
                  )}
                </ChamferFrame>
              </div>
            );
          })}

        {/* Spacer to maintain layout height without blowing mobile width */}
        <div
          className="max-w-full"
          style={{
            width: Math.min(top.layoutWidth + (previewItems.length - 1) * 4, top.layoutWidth),
            height: top.layoutHeight,
          }}
        />

        {/* Badge */}
        <div className="absolute -top-2 -right-2 z-10 bg-primary text-primary-foreground text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {items.length}
        </div>

        {/* Hover label */}
        <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <span className="text-xs bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-muted-foreground">
            Click to expand
          </span>
        </div>
      </button>
    );
  }

  // Fanned state — show all items side-by-side, click individual to open lightbox
  return (
    <div className="relative">
      <button
        onClick={() => setFanned(false)}
        className="absolute -top-8 right-0 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        <Layers className="w-3 h-3" /> Collapse
      </button>
      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className="group relative focus:outline-none"
          >
            <ChamferFrame
              className="overflow-hidden"
              style={{ width: item.layoutWidth, height: item.layoutHeight }}
            >
              {item.confidential ? (
                <div className="w-full h-full bg-surface flex items-center justify-center">
                  <Lock className="w-6 h-6 text-muted-foreground opacity-40" />
                </div>
              ) : (
                <CloudImage
                  publicId={item.cloudinaryId}
                  alt={item.title}
                  width={item.layoutWidth}
                  height={item.layoutHeight}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </ChamferFrame>
            <p className="mt-1 text-xs text-muted-foreground truncate" style={{ maxWidth: item.layoutWidth }}>
              {item.title}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
