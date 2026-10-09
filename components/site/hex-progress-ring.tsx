import { HEX_CLIP_PATH } from "@/lib/hex";
import { cn } from "@/lib/utils";

interface HexProgressRingProps {
  progress: number; // 0-100
  className?: string;
  size?: number; // px, default 120
}

export function HexProgressRing({
  progress,
  className,
  size = 120,
}: HexProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Outer Hex Container with clipped background */}
      <div
        className="absolute inset-0 bg-surface border border-border flex items-center justify-center shadow-inner"
        style={{ clipPath: HEX_CLIP_PATH }}
      >
        {/* Dynamic fill layer from bottom up matching progress */}
        <div
          className="absolute inset-x-0 bottom-0 bg-primary/20 transition-all duration-700 ease-out"
          style={{ height: `${clamped}%` }}
        />

        {/* Center label */}
        <div className="relative z-10 text-center space-y-0.5">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-primary leading-none">
            {clamped}%
          </span>
          <span className="block text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            Complete
          </span>
        </div>
      </div>
    </div>
  );
}
