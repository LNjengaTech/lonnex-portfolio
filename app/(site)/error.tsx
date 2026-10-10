"use client";

import { useEffect } from "react";
import Link from "next/link";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client exceptions
    console.error("Site error captured:", error);
  }, [error]);

  return (
    <div className="relative overflow-hidden flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 text-center">
      {/* Background wireframe decoration */}
      <HexWireframeClusters
        variant="all"
        strokeWidth={0.65}
        className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-40"
      />

      {/* Hex Warning Badge */}
      <div className="relative z-10" aria-hidden="true">
        <div
          className="relative flex items-center justify-center bg-surface border border-danger/40"
          style={{ width: 100, height: 115, clipPath: HEX_CLIP_PATH }}
        >
          <AlertTriangle className="h-10 w-10 text-danger" />
        </div>
      </div>

      {/* Heading & description */}
      <div className="relative z-10 space-y-2 max-w-md">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-danger font-semibold">
          Cell Transmission Error
        </p>
        <h1 className="font-black text-2xl sm:text-3xl text-foreground uppercase tracking-tight">
          System Interruption
        </h1>
        <p className="text-sm text-muted-foreground">
          An unexpected glitch occurred while loading this cell. The error has been logged for review.
        </p>
      </div>

      {/* Action buttons */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-[0.25em] px-5 py-2.5 hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Re-try cell</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-border bg-surface text-foreground font-mono text-xs uppercase tracking-[0.25em] px-5 py-2.5 hover:border-primary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <span>Return home</span>
        </Link>
      </div>
    </div>
  );
}
