"use client";

import { useEffect, useRef, useState } from "react";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { BrandLogoMark } from "@/components/hex/brand-logo-mark";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";

/**
 * HexLoader — first-visit only intro animation.
 *
 * Sequence (CSS-only, motion-safe):
 *  1. Logo mark draws/assembles (scale from 0)
 *  2. Tagline types in with a blinking cursor
 *  3. Whole loader fades/scales out revealing the home
 *
 * Stores a sessionStorage flag so it never repeats in the same tab.
 * Respects prefers-reduced-motion: skips straight through if set.
 */
export function HexLoader({ tagline = "The Hive" }: { tagline?: string }) {
  const [phase, setPhase] = useState<"logo" | "tagline" | "exit" | "done">("logo");
  const [visible, setVisible] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check session flag
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("hive-loader-seen");

    if (seen || reduced) {
      setPhase("done");
      return;
    }

    setVisible(true);

    // Phase 1: logo reveal → 900ms
    timerRef.current = setTimeout(() => {
      setPhase("tagline");
    }, 900);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Phase 2: type tagline
  useEffect(() => {
    if (phase !== "tagline") return;
    if (typedChars >= tagline.length) {
      // Pause then exit
      timerRef.current = setTimeout(() => setPhase("exit"), 700);
      return;
    }
    timerRef.current = setTimeout(() => {
      setTypedChars((n) => n + 1);
    }, 70);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, typedChars, tagline]);

  // Phase 3: exit animation → mark done
  useEffect(() => {
    if (phase !== "exit") return;
    timerRef.current = setTimeout(() => {
      sessionStorage.setItem("hive-loader-seen", "1");
      setPhase("done");
    }, 700);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-background overflow-hidden"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "exit" ? "scale(1.04)" : "scale(1)",
        transition: "opacity 700ms cubic-bezier(0.76,0,0.24,1), transform 700ms cubic-bezier(0.76,0,0.24,1)",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      {/* Background geometric wireframe clusters with glowing dots */}
      <HexWireframeClusters
        variant="all"
        strokeWidth={0.65}
        className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-60"
      />

      {/* Logo */}
      <div
        className="relative z-10"
        style={{
          opacity: phase === "logo" ? (visible ? 1 : 0) : 1,
          transform: phase === "logo" ? (visible ? "scale(1)" : "scale(0.4)") : "scale(1)",
          transition: "opacity 600ms cubic-bezier(0.76,0,0.24,1), transform 600ms cubic-bezier(0.76,0,0.24,1)",
        }}
      >
        <div
          className="flex items-center justify-center bg-primary"
          style={{ width: 72, height: 83, clipPath: HEX_CLIP_PATH }}
        >
          <BrandLogoMark size={40} className="text-primary-foreground" />
        </div>
      </div>

      {/* Tagline typewriter */}
      <div
        className="relative z-10 mt-6 h-7 overflow-hidden"
        style={{
          opacity: phase === "tagline" || phase === "exit" ? 1 : 0,
          transition: "opacity 300ms",
        }}
      >
        <p className="font-mono text-sm uppercase tracking-[0.4em] text-foreground">
          {tagline.slice(0, typedChars)}
          <span className="animate-pulse">_</span>
        </p>
      </div>
    </div>
  );
}
