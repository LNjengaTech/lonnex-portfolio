import Link from "next/link";
import { HEX_CLIP_PATH } from "@/lib/hex";
import { BrandLogoMark } from "@/components/hex/brand-logo-mark";
import { HexWireframeClusters } from "@/components/hex/hex-wireframe-clusters";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 text-center">
      {/* Background geometric wireframe clusters with glowing dots */}
      <HexWireframeClusters
        variant="all"
        strokeWidth={0.65}
        className="absolute inset-0 z-0 pointer-events-none opacity-35 dark:opacity-50"
      />

      {/* Broken hex visual */}
      <div className="relative z-10" aria-hidden="true">
        {/* Outer broken hex — offset, lower opacity */}
        <div
          className="absolute"
          style={{
            width: 120,
            height: 138,
            top: 8,
            left: 8,
            clipPath: HEX_CLIP_PATH,
            background: "var(--border)",
            opacity: 0.4,
          }}
        />
        {/* Main hex */}
        <div
          className="relative flex items-center justify-center bg-surface border border-border"
          style={{ width: 120, height: 138, clipPath: HEX_CLIP_PATH }}
        >
          <BrandLogoMark size={48} className="text-muted-foreground opacity-40" />
        </div>
      </div>

      {/* Error code */}
      <div className="relative z-10 space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
          cell not found
        </p>
        <h1 className="font-black text-6xl sm:text-8xl text-foreground leading-none">
          404
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          This cell doesn&apos;t exist in the hive. It may have moved, or never existed.
        </p>
      </div>

      {/* Back home */}
      <Link
        href="/"
        className="relative z-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-primary hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4"
      >
        ← Return to the hive
      </Link>
    </div>
  );
}
