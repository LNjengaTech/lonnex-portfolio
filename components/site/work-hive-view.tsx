"use client";

import * as React from "react";
import { packHoneycomb, calcHexWidth, type HexSize } from "@/lib/hex";
import { ProjectHexTile } from "@/components/site/project-hex-tile";
import type { PublicProjectItem } from "@/lib/db/queries/projects";

interface WorkHiveViewProps {
  projects: PublicProjectItem[];
  matchingProjectIds: Set<number>;
  className?: string;
}

export function WorkHiveView({
  projects,
  matchingProjectIds,
}: WorkHiveViewProps) {
  // Map project tile size to packing HexSize (1, 2, 3)
  const packableItems = React.useMemo(() => {
    return projects.map((p) => {
      let size: HexSize = 1;
      if (p.tileSize === "XL") size = 3;
      else if (p.tileSize === "L") size = 2;
      else size = 1;

      return {
        id: String(p.id),
        size,
        project: p,
      };
    });
  }, [projects]);

  // Pack into honeycomb mosaic (cellRadius = 64px for balanced desktop density)
  const cellRadius = 64;
  const placed = React.useMemo(() => {
    return packHoneycomb(packableItems, cellRadius);
  }, [packableItems]);

  // Compute bounding box
  const bounds = React.useMemo(() => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const p of placed) {
      const h = p.size * cellRadius * 2;
      const w = calcHexWidth(h);
      const left = p.pixel.x - w / 2;
      const right = p.pixel.x + w / 2;
      const top = p.pixel.y - h / 2;
      const bottom = p.pixel.y + h / 2;

      if (left < minX) minX = left;
      if (right > maxX) maxX = right;
      if (top < minY) minY = top;
      if (bottom > maxY) maxY = bottom;
    }

    if (placed.length === 0) {
      return { width: 400, height: 400, offsetX: 0, offsetY: 0 };
    }

    const padding = 60;
    const totalW = maxX - minX + 2 * padding;
    const totalH = maxY - minY + 2 * padding;

    return {
      width: totalW,
      height: totalH,
      offsetX: -minX + padding,
      offsetY: -minY + padding,
    };
  }, [placed]);

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground font-mono text-sm uppercase">
        No projects found in the Hive.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ── Desktop & Tablet: Mathematical Non-Overlapping Honeycomb Wall (>= 768px) ── */}
      <div className="hidden md:flex justify-center overflow-x-auto py-8">
        <div
          className="relative transition-all duration-500"
          style={{
            width: `${Math.max(bounds.width, 700)}px`,
            height: `${Math.max(bounds.height, 500)}px`,
          }}
        >
          {placed.map((item, idx) => {
            const p = item.item.project;
            const h = item.size * cellRadius * 2;
            const posX = item.pixel.x + bounds.offsetX;
            const posY = item.pixel.y + bounds.offsetY;
            const isMatch = matchingProjectIds.has(p.id);
            const numLabel = String(idx + 1).padStart(2, "0");

            return (
              <div
                key={p.id}
                className="absolute transition-transform duration-500"
                style={{
                  left: `${posX}px`,
                  top: `${posY}px`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <ProjectHexTile
                  project={p}
                  height={h}
                  numberLabel={numLabel}
                  isFilteredOut={!isMatch}
                  priority={idx === 0}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Mobile View: Interlocking Vertical Zig-Zag Column (< 768px) ── */}
      <div className="flex md:hidden flex-col items-center py-6 px-4">
        <div className="relative w-full max-w-sm flex flex-col items-center">
          {projects.map((p, idx) => {
            const isMatch = matchingProjectIds.has(p.id);
            const numLabel = String(idx + 1).padStart(2, "0");

            // Mobile heights: XL gets 260px, L gets 230px, M/S get 200px
            const mobileHeight =
              p.tileSize === "XL" ? 260 : p.tileSize === "L" ? 230 : 200;

            // Zig-zag offset: alternate slightly left and right
            const isRight = idx % 2 === 1;
            const horizontalOffset = isRight ? "translate-x-3" : "-translate-x-3";

            return (
              <div
                key={p.id}
                className={`transition-transform duration-300 ${horizontalOffset} -mt-8 first:mt-0`}
              >
                <ProjectHexTile
                  project={p}
                  height={mobileHeight}
                  numberLabel={numLabel}
                  isFilteredOut={!isMatch}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
