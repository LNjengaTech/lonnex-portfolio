"use client";

import * as React from "react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";
import { Lock, Play } from "lucide-react";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";

interface HexTilePreviewProps {
  title: string;
  category: string;
  tileSize: "S" | "M" | "L" | "XL";
  coverUrl?: string;
  previewVideoUrl?: string;
  confidential?: boolean;
  className?: string;
}

export function HexTilePreview({
  title,
  category,
  tileSize = "M",
  coverUrl,
  previewVideoUrl,
  confidential = false,
  className,
}: HexTilePreviewProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Dimension scaling by tile size (height in px; width = 0.866 * height)
  const sizeMap = {
    S: { height: 160, width: 138, text: "text-[11px]" },
    M: { height: 210, width: 182, text: "text-xs" },
    L: { height: 260, width: 225, text: "text-sm" },
    XL: { height: 320, width: 277, text: "text-base" },
  };

  const { height, width, text: textSize } = sizeMap[tileSize] || sizeMap.M;
  const resolvedCover = resolveMediaUrl(coverUrl, { width: 800, height: 600 });
  const resolvedVideo = resolveMediaUrl(previewVideoUrl, { type: "video" });

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center justify-between w-full text-xs font-mono uppercase text-muted-foreground">
        <span>Live Tile Preview</span>
        <span className="font-bold text-primary">Size: {tileSize}</span>
      </div>

      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group transition-transform duration-300 select-none cursor-pointer"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Layered Brand Hex Wireframe Accent (Hive Signature) */}
        <div
          className="absolute inset-0 border-2 border-primary/30 pointer-events-none transition-transform duration-300"
          style={{
            clipPath: HEX_CLIP_PATH,
            transform: isHovered ? "translate(6px, 6px)" : "translate(4px, 4px)",
          }}
        />

        {/* The Clipped Hex Tile Content */}
        <div
          className="absolute inset-0 overflow-hidden bg-surface border border-border shadow-lg"
          style={{ clipPath: HEX_CLIP_PATH }}
        >
          {/* Cover Image or Video Preview */}
          {resolvedCover ? (
            <div
              className={cn(
                "absolute inset-0 h-full w-full transition-transform duration-500",
                isHovered && "scale-105",
                confidential && "filter blur-sm"
              )}
            >
              {isHovered && resolvedVideo ? (
                <video
                  src={resolvedVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={resolvedCover}
                  alt={title || "Project cover"}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-background/80 text-muted-foreground font-mono text-xs uppercase">
              No Cover
            </div>
          )}

          {/* Dark Overlay Gradient simulation using solid opacity */}
          <div className="absolute inset-0 bg-background/50 hover:bg-background/40 transition-colors" />

          {/* Confidential Shield Overlay */}
          {confidential && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/70 p-3 text-center z-10">
              <Lock className="h-5 w-5 text-warning mb-1" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-warning font-bold">
                Confidential
              </span>
            </div>
          )}

          {/* Tile Labels & Category */}
          <div className="absolute inset-x-0 bottom-4 p-3 flex flex-col items-center text-center z-20">
            <span className="font-mono text-[9px] uppercase tracking-widest text-primary bg-background/90 px-1.5 py-0.5 border border-border mb-1">
              {category}
            </span>
            <h4
              className={cn(
                "font-black tracking-tight text-foreground line-clamp-2 px-2",
                textSize
              )}
            >
              {title || "Untitled Project"}
            </h4>

            {previewVideoUrl && (
              <div className="mt-1 flex items-center gap-1 text-[9px] font-mono uppercase text-muted-foreground">
                <Play className="h-2.5 w-2.5 text-primary inline" />
                <span>Video Clip</span>
              </div>
            )}
          </div>

          {/* Outer Border inside hex */}
          <div
            className="absolute inset-0 border border-primary/40 pointer-events-none"
            style={{ clipPath: HEX_CLIP_PATH }}
          />
        </div>
      </div>
    </div>
  );
}
