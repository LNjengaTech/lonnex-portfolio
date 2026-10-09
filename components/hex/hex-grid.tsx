import * as React from "react";
import { cn } from "@/lib/utils";

export interface HexGridProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  cols?: number;
  cellSize?: number;
  interactive?: boolean;
  breathe?: boolean;
  children?: React.ReactNode;
}

export function HexGrid({
  rows = 4,
  cols = 6,
  cellSize = 50,
  interactive = false,
  breathe = false,
  className,
  children,
  ...props
}: HexGridProps) {
  // Pointy-top hex math
  const hexWidth = Math.round(cellSize * Math.sqrt(3) * 100) / 100;
  const hexHeight = cellSize * 2;
  const vertSpacing = (hexHeight * 3) / 4;

  const hexPoints = (cx: number, cy: number) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      const px = Math.round((cx + cellSize * Math.cos(angle)) * 100) / 100;
      const py = Math.round((cy + cellSize * Math.sin(angle)) * 100) / 100;
      points.push(`${px},${py}`);
    }
    return points.join(" ");
  };

  const cells: Array<{ id: string; points: string; cx: number; cy: number }> =
    [];

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (hexWidth / 2);
    for (let c = 0; c < cols; c++) {
      const cx = c * hexWidth + offset + hexWidth / 2;
      const cy = r * vertSpacing + hexHeight / 2;
      cells.push({
        id: `${r}-${c}`,
        points: hexPoints(cx, cy),
        cx,
        cy,
      });
    }
  }

  const svgWidth = cols * hexWidth + hexWidth / 2;
  const svgHeight = rows * vertSpacing + hexHeight / 4;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        breathe && "motion-safe:animate-pulse",
        className
      )}
      {...props}
    >
      <svg
        className="stroke-border/40 fill-transparent pointer-events-none w-full h-auto"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {cells.map((cell) => (
          <polygon
            key={cell.id}
            points={cell.points}
            strokeWidth="1"
            className={cn(
              "transition-colors duration-300",
              interactive && "hover:stroke-primary hover:fill-surface/40 pointer-events-auto cursor-pointer"
            )}
          />
        ))}
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
