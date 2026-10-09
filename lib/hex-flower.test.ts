import { describe, expect, it } from "vitest";
import { calcHexWidth, HEX_ASPECT_RATIO } from "./hex";

describe("Phase 7: Honeycomb flower & zig-zag geometry", () => {
  it("verifies 7-hex pointy-top flower interlocks with exact adjacent distances", () => {
    const height = 160;
    const width = calcHexWidth(height); // height * sqrt(3)/2

    // Center of photo hex
    const center = { x: 1.5 * width, y: 1.25 * height };

    // 6 surrounding rooms (center-to-center coordinates)
    const rooms = [
      { name: "Work", x: center.x - width / 2, y: center.y - 0.75 * height },
      { name: "Studio", x: center.x + width / 2, y: center.y - 0.75 * height },
      { name: "Journal", x: center.x + width, y: center.y },
      { name: "About", x: center.x + width / 2, y: center.y + 0.75 * height },
      { name: "Now", x: center.x - width / 2, y: center.y + 0.75 * height },
      { name: "Contact", x: center.x - width, y: center.y },
    ];

    // Every room must be exactly distance = width from the center
    for (const r of rooms) {
      const dx = r.x - center.x;
      const dy = r.y - center.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeCloseTo(width, 2);
    }

    // Every adjacent pair in the ring must be exactly distance = width apart
    for (let i = 0; i < 6; i++) {
      const curr = rooms[i];
      const next = rooms[(i + 1) % 6];
      const dx = next.x - curr.x;
      const dy = next.y - curr.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      expect(dist).toBeCloseTo(width, 2);
    }
  });

  it("verifies mobile vertical zig-zag stays within narrow mobile screen widths (320px)", () => {
    const height = 120;
    const width = Math.round(height * HEX_ASPECT_RATIO);
    const horizShift = Math.round(width * 0.45);
    const totalW = width + horizShift;

    // Total width must be well below 320px (the narrowest mobile viewport)
    expect(totalW).toBeLessThan(260);
    expect(totalW).toBeGreaterThan(140);
  });
});
