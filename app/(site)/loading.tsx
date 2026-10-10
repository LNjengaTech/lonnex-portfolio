import { SkeletonHex } from "@/components/hex/skeleton-hex";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";

export default function Loading() {
  return (
    <div
      className="relative overflow-hidden flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-16"
      role="status"
      aria-label="Loading content"
    >
      {/* Background wireframe decoration */}
      <HexWireframeClusters
        variant="all"
        strokeWidth={0.65}
        className="absolute inset-0 z-0 pointer-events-none opacity-25 dark:opacity-40"
      />

      {/* Hex cluster skeleton */}
      <div className="relative z-10 flex items-center justify-center gap-3" aria-hidden="true">
        <SkeletonHex height={72} className="opacity-40" />
        <SkeletonHex height={96} className="opacity-80" />
        <SkeletonHex height={72} className="opacity-40" />
      </div>

      {/* Status label */}
      <p className="relative z-10 font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground animate-pulse">
        Synchronizing cell…
      </p>
    </div>
  );
}
