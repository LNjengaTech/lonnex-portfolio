"use client";

import { useEffect, useRef } from "react";
import { HEX_CLIP_PATH } from "@/lib/hex";

/**
 * Custom pointy-top hex cursor — desktop only.
 * Injects a fixed SVG element that follows the pointer via transform.
 * Hidden on touch devices and when prefers-reduced-motion is set.
 */
export function HexCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    // Hide on touch-primary input
    const mq = window.matchMedia("(pointer: coarse)");
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mq.matches || reducedMq.matches) return;

    // Hide system cursor on the document
    document.documentElement.style.cursor = "none";

    let x = -100;
    let y = -100;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        el.style.transform = `translate(${x - 14}px, ${y - 16}px)`;
        rafRef.current = null;
      });
    };

    const onLeave = () => {
      el.style.opacity = "0";
    };
    const onEnter = () => {
      el.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-7 w-6 transition-opacity duration-150 hidden sm:block"
      style={{ willChange: "transform" }}
    >
      {/* Pointy-top hex shape */}
      <div
        className="h-full w-full bg-primary mix-blend-difference"
        style={{ clipPath: HEX_CLIP_PATH }}
      />
    </div>
  );
}
