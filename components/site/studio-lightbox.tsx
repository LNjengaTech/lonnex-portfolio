"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudioLayoutItem } from "@/lib/studio-layout";

interface StudioLightboxProps {
  items: StudioLayoutItem[];
  initialIndex: number;
  onClose: () => void;
}

export function StudioLightbox({ items, initialIndex, onClose }: StudioLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const item = items[index];
  const isVideo = item.mediaType === "video";

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [items.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + items.length) % items.length);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "+") setZoom((z) => Math.min(z + 0.5, 4));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.5, 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, goNext, goPrev]);

  // Touch swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (Math.abs(dx) > 50) dx < 0 ? goNext() : goPrev();
    touchStart.current = null;
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    setPan({
      x: dragStart.current.px + e.clientX - dragStart.current.x,
      y: dragStart.current.py + e.clientY - dragStart.current.y,
    });
  };
  const onMouseUp = () => setIsDragging(false);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-surface/90 backdrop-blur-sm text-muted-foreground hover:text-foreground border border-border transition-colors"
        aria-label="Close lightbox"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {items.length > 1 && (
        <div className="absolute top-3.5 left-4 sm:top-4 sm:left-1/2 sm:-translate-x-1/2 z-20 text-xs font-mono text-muted-foreground bg-surface/70 px-2.5 py-1 rounded-full border border-border/50">
          {index + 1} / {items.length}
        </div>
      )}

      {/* Prev (desktop) */}
      {items.length > 1 && (
        <button
          onClick={goPrev}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Previous item"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image / Video */}
      <div
        className={cn(
          "relative max-w-[96vw] max-h-[75vh] sm:max-w-[90vw] sm:max-h-[85vh] overflow-hidden select-none flex items-center justify-center",
          zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-default"
        )}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="transition-transform duration-150"
          style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
        >
          {item.confidential ? (
            <div className="flex flex-col items-center justify-center w-[75vw] sm:w-[50vw] h-[50vh] sm:h-[60vh] bg-surface border border-border rounded gap-3 text-muted-foreground">
              <Lock className="w-10 sm:w-12 h-10 sm:h-12 opacity-40" />
              <span className="text-xs sm:text-sm text-center px-4">Confidential — NDA protected</span>
            </div>
          ) : isVideo ? (
            <video
              src={item.mediaUrl}
              controls
              autoPlay
              className="max-w-[94vw] max-h-[70vh] sm:max-w-[88vw] sm:max-h-[80vh] rounded"
            />
          ) : (
            <img
              src={item.mediaUrl}
              alt={item.title}
              className="max-w-[94vw] max-h-[70vh] sm:max-w-[88vw] sm:max-h-[80vh] object-contain rounded"
              draggable={false}
            />
          )}
        </div>
      </div>

      {/* Next (desktop) */}
      {items.length > 1 && (
        <button
          onClick={goNext}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next item"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Spec panel */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 text-center pointer-events-none w-full max-w-[92vw] px-4">
        <p className="text-xs sm:text-sm font-medium text-foreground truncate">{item.title}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{item.specLabel} · {item.year}</p>
      </div>

      {/* Zoom controls */}
      {!isVideo && !item.confidential && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface/90 backdrop-blur-sm border border-border rounded-full px-3 py-1">
          <button
            onClick={() => { setZoom((z) => Math.max(z - 0.5, 1)); setPan({ x: 0, y: 0 }); }}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="text-[11px] sm:text-xs text-muted-foreground w-9 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
