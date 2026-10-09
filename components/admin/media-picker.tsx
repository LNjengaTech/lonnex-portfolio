"use client";

import * as React from "react";
import { Check, Search, X } from "lucide-react";
import { CloudImage } from "@/components/site/cloud-image";
import { SkeletonHex } from "@/components/hex/skeleton-hex";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface MediaAsset {
  id: number;
  publicId: string;
  type: "image" | "video";
  width: number;
  height: number;
  format: string;
  bytes: number;
  altText: string;
  dominantColor?: string;
}

interface MediaPickerProps {
  assets: MediaAsset[];
  selected?: number[];
  multiSelect?: boolean;
  onSelect: (assets: MediaAsset[]) => void;
  onClose: () => void;
  filter?: "image" | "video" | "all";
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function MediaPicker({
  assets,
  selected = [],
  multiSelect = false,
  onSelect,
  onClose,
  filter = "all",
  isLoading = false,
}: MediaPickerProps) {
  const [query, setQuery] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(
    new Set(selected)
  );

  const filtered = assets.filter((a) => {
    const matchesType = filter === "all" || a.type === filter;
    const matchesQuery =
      !query ||
      a.altText.toLowerCase().includes(query.toLowerCase()) ||
      a.publicId.toLowerCase().includes(query.toLowerCase());
    return matchesType && matchesQuery;
  });

  function toggleAsset(asset: MediaAsset) {
    if (multiSelect) {
      const next = new Set(selectedIds);
      if (next.has(asset.id)) {
        next.delete(asset.id);
      } else {
        next.add(asset.id);
      }
      setSelectedIds(next);
    } else {
      setSelectedIds(new Set([asset.id]));
    }
  }

  function confirm() {
    const selectedAssets = assets.filter((a) => selectedIds.has(a.id));
    onSelect(selectedAssets);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-50 flex h-[90vh] w-full max-w-4xl flex-col border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Media Library
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {filtered.length} assets · {selectedIds.size} selected
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={confirm}
              disabled={selectedIds.size === 0}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Use Selected ({selectedIds.size})
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-7 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer border border-border"
              aria-label="Close media picker"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by alt text or public ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              chamfer={false}
            />
          </div>
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonHex key={i} height={80} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="font-mono text-xs uppercase text-muted-foreground">
                No assets found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {filtered.map((asset) => {
                const isSelected = selectedIds.has(asset.id);
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => toggleAsset(asset)}
                    className={cn(
                      "group relative aspect-square overflow-hidden border-2 transition-colors cursor-pointer",
                      isSelected
                        ? "border-primary"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    {asset.type === "image" ? (
                      <CloudImage
                        publicId={asset.publicId}
                        alt={asset.altText}
                        width={160}
                        height={160}
                        className="h-full w-full"
                        dominantColor={asset.dominantColor}
                        sizes="160px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-background">
                        <Badge variant="secondary">Video</Badge>
                      </div>
                    )}

                    {/* Selected overlay */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                        <div className="flex h-6 w-6 items-center justify-center bg-primary text-primary-foreground">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    )}

                    {/* Size badge */}
                    <div className="absolute bottom-1 right-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="bg-background/80 px-1.5 py-0.5 font-mono text-[9px] uppercase text-foreground">
                        {formatBytes(asset.bytes)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
