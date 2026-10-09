"use client";

import * as React from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";

interface HexPhotoPreviewProps {
  photoUrl: string;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  onCropChange?: (crops: { zoom: number; offsetX: number; offsetY: number }) => void;
  className?: string;
}

export function HexPhotoPreview({
  photoUrl,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
  onCropChange,
  className,
}: HexPhotoPreviewProps) {
  const [currentZoom, setCurrentZoom] = React.useState(zoom);
  const [currentOffsetX, setCurrentOffsetX] = React.useState(offsetX);
  const [currentOffsetY, setCurrentOffsetY] = React.useState(offsetY);

  React.useEffect(() => {
    setCurrentZoom(zoom);
    setCurrentOffsetX(offsetX);
    setCurrentOffsetY(offsetY);
  }, [zoom, offsetX, offsetY]);

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentZoom(val);
    onCropChange?.({
      zoom: val,
      offsetX: currentOffsetX,
      offsetY: currentOffsetY,
    });
  };

  const handleOffsetChange = (axis: "x" | "y", delta: number) => {
    const newX = axis === "x" ? currentOffsetX + delta : currentOffsetX;
    const newY = axis === "y" ? currentOffsetY + delta : currentOffsetY;
    setCurrentOffsetX(newX);
    setCurrentOffsetY(newY);
    onCropChange?.({
      zoom: currentZoom,
      offsetX: newX,
      offsetY: newY,
    });
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative flex items-center justify-center p-6 bg-background border border-border">
        {/* Layered brand offset hex #2 (outer accent) */}
        <div
          className="absolute h-52 w-44 border-2 border-primary/20 pointer-events-none transition-transform"
          style={{
            clipPath: HEX_CLIP_PATH,
            transform: "translate(8px, 8px)",
          }}
        />

        {/* Layered brand offset hex #1 (subtle backing) */}
        <div
          className="absolute h-52 w-44 bg-surface border border-border pointer-events-none"
          style={{
            clipPath: HEX_CLIP_PATH,
            transform: "translate(-4px, -4px)",
          }}
        />

        {/* The Clipped Hex Photo Container */}
        <div
          className="relative h-52 w-44 overflow-hidden bg-surface border border-border shadow-inner"
          style={{ clipPath: HEX_CLIP_PATH }}
        >
          {photoUrl ? (
            <div
              className="absolute inset-0 h-full w-full transition-transform duration-75"
              style={{
                transform: `scale(${currentZoom}) translate(${currentOffsetX}px, ${currentOffsetY}px)`,
              }}
            >
              {/* Unoptimized or standard img to support external or cloudinary URLs flexibly */}
              <img
                src={resolveMediaUrl(photoUrl, { width: 600, height: 600 })}
                alt="Profile photo hex preview"
                className="h-full w-full object-cover pointer-events-none select-none"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground font-mono text-xs uppercase">
              No Photo
            </div>
          )}

          {/* Border overlay around hexagon */}
          <div
            className="absolute inset-0 border-2 border-primary/40 pointer-events-none"
            style={{ clipPath: HEX_CLIP_PATH }}
          />
        </div>
      </div>

      {/* Hex Crop Controls */}
      {photoUrl && onCropChange && (
        <div className="w-full max-w-xs space-y-3 bg-surface p-3 border border-border">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-muted-foreground">
            <span>Hex Crop Framing</span>
            <span>{currentZoom.toFixed(1)}x</span>
          </div>

          <div className="flex items-center gap-2">
            <ZoomOut className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={currentZoom}
              onChange={handleZoomChange}
              className="w-full accent-primary cursor-pointer"
            />
            <ZoomIn className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 border-t border-border/50">
            <span className="font-mono text-[10px] uppercase text-muted-foreground mr-1">
              Pan:
            </span>
            <button
              type="button"
              onClick={() => handleOffsetChange("x", -5)}
              className="px-2 py-0.5 border border-border text-[10px] font-mono hover:bg-background cursor-pointer"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleOffsetChange("x", 5)}
              className="px-2 py-0.5 border border-border text-[10px] font-mono hover:bg-background cursor-pointer"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => handleOffsetChange("y", -5)}
              className="px-2 py-0.5 border border-border text-[10px] font-mono hover:bg-background cursor-pointer"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => handleOffsetChange("y", 5)}
              className="px-2 py-0.5 border border-border text-[10px] font-mono hover:bg-background cursor-pointer"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentOffsetX(0);
                setCurrentOffsetY(0);
                setCurrentZoom(1);
                onCropChange({ zoom: 1, offsetX: 0, offsetY: 0 });
              }}
              className="ml-auto px-2 py-0.5 text-[9px] font-mono uppercase text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
