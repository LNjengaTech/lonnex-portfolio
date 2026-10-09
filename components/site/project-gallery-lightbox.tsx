"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { ChamferFrame } from "@/components/hex/chamfer-frame";
import { resolveMediaUrl } from "@/lib/cloudinary-utils";
import { cn } from "@/lib/utils";
import type { ProjectMediaItem } from "@/lib/db/queries/projects";

interface ProjectGalleryLightboxProps {
  media: ProjectMediaItem[];
  projectTitle: string;
  className?: string;
}

export function ProjectGalleryLightbox({
  media,
  projectTitle,
  className,
}: ProjectGalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [isZoomed, setIsZoomed] = React.useState(false);

  // Close lightbox on Escape, navigate with Left/Right
  React.useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveIndex(null);
        setIsZoomed(false);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : media.length - 1) : null
        );
        setIsZoomed(false);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev !== null ? (prev < media.length - 1 ? prev + 1 : 0) : null
        );
        setIsZoomed(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, media.length]);

  if (!media || media.length === 0) return null;

  const currentItem = activeIndex !== null ? media[activeIndex] : null;
  const currentUrl = currentItem
    ? resolveMediaUrl(currentItem.url || currentItem.cloudinaryId, {
        width: 1600,
        height: 1200,
      })
    : "";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Mixed Sizes Gallery Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {media.map((item, idx) => {
          const itemUrl = resolveMediaUrl(item.url || item.cloudinaryId, {
            width: 1000,
            height: 700,
          });

          // First item or wide item spans 2 columns
          const isFeatured = idx === 0 && media.length > 1;

          return (
            <div
              key={item.id || idx}
              className={cn(
                "group relative cursor-pointer select-none",
                isFeatured && "md:col-span-2"
              )}
              onClick={() => {
                setActiveIndex(idx);
                setIsZoomed(false);
              }}
            >
              <ChamferFrame
                corners={idx % 2 === 0 ? "tr-bl" : "tl-br"}
                cutSize={18}
                className="w-full bg-surface border border-border group-hover:border-primary transition-colors duration-300"
              >
                <div
                  className={cn(
                    "relative w-full overflow-hidden bg-surface",
                    isFeatured ? "aspect-16/9 md:aspect-21/9" : "aspect-4/3 sm:aspect-16/10"
                  )}
                >
                  {item.mediaType === "video" ? (
                    <video
                      src={itemUrl}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                  ) : (
                    <img
                      src={itemUrl}
                      alt={item.caption || `${projectTitle} gallery shot ${idx + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                      loading="lazy"
                    />
                  )}

                  {/* Hover Overlay with Caption & Fullscreen Prompt */}
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4">
                    <div className="flex justify-end">
                      <span className="p-1.5 bg-surface/90 text-primary border border-border">
                        <Maximize2 className="h-4 w-4" />
                      </span>
                    </div>

                    {item.caption && (
                      <div className="bg-surface/90 border border-border p-2">
                        <p className="font-mono text-xs uppercase tracking-wider text-foreground line-clamp-2">
                          {item.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </ChamferFrame>

              {/* Caption Underneath */}
              {item.caption && (
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-1">
                  <span>{item.caption}</span>
                  <span className="text-primary">[{idx + 1}/{media.length}]</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Lightbox Modal ── */}
      {activeIndex !== null && currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${projectTitle} artwork viewer`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4 sm:p-8"
        >
          {/* Top Control Bar */}
          <div className="absolute top-4 left-4 right-4 z-60 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span className="text-primary font-bold">{projectTitle}</span>
              <span>·</span>
              <span>{activeIndex + 1} of {media.length}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                className="p-2 bg-surface border border-border text-foreground hover:border-primary transition-colors"
              >
                {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveIndex(null);
                  setIsZoomed(false);
                }}
                aria-label="Close lightbox"
                className="p-2 bg-surface border border-border text-foreground hover:text-danger hover:border-danger transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Navigation Prev Button */}
          {media.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setActiveIndex((prev) =>
                  prev !== null ? (prev > 0 ? prev - 1 : media.length - 1) : null
                );
                setIsZoomed(false);
              }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-60 p-3 bg-surface/80 hover:bg-surface border border-border text-foreground hover:border-primary transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Navigation Next Button */}
          {media.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setActiveIndex((prev) =>
                  prev !== null ? (prev < media.length - 1 ? prev + 1 : 0) : null
                );
                setIsZoomed(false);
              }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-60 p-3 bg-surface/80 hover:bg-surface border border-border text-foreground hover:border-primary transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Main Display Area */}
          <div
            className={cn(
              "relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center justify-center overflow-auto",
              isZoomed && "cursor-zoom-out"
            )}
            onClick={() => isZoomed && setIsZoomed(false)}
          >
            {currentItem.mediaType === "video" ? (
              <video
                src={currentUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[75vh] w-auto max-w-full border border-border shadow-2xl"
              />
            ) : (
              <img
                src={currentUrl}
                alt={currentItem.caption || `${projectTitle} full shot`}
                className={cn(
                  "max-h-[75vh] w-auto max-w-full object-contain border border-border shadow-2xl transition-transform duration-300",
                  isZoomed && "scale-150 cursor-zoom-out"
                )}
              />
            )}

            {/* Caption beneath lightbox item */}
            {currentItem.caption && (
              <div className="mt-4 max-w-2xl text-center bg-surface border border-border px-4 py-2">
                <p className="font-mono text-xs uppercase tracking-wider text-foreground">
                  {currentItem.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
