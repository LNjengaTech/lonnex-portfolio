import { describe, expect, it } from "vitest";
import {
  cloudImageUrl,
  cloudVideoUrl,
  cloudVideoPosterUrl,
  dominantColorPlaceholder,
  resolveMediaUrl,
} from "./cloudinary-utils";

describe("cloudinary URL builders", () => {
  it("builds an image URL with transforms", () => {
    const url = cloudImageUrl("portfolio/projects/sample", {
      width: 800,
      height: 600,
      crop: "fill",
    });
    expect(url).toContain("/image/upload/");
    expect(url).toContain("f_auto");
    expect(url).toContain("q_auto");
    expect(url).toContain("c_fill");
    expect(url).toContain("w_800");
    expect(url).toContain("h_600");
    expect(url).toContain("portfolio/projects/sample");
  });

  it("builds a video URL with f_auto,q_auto", () => {
    const url = cloudVideoUrl("portfolio/projects/demo");
    expect(url).toContain("/video/upload/");
    expect(url).toContain("f_auto");
    expect(url).toContain("q_auto");
    expect(url).toContain("portfolio/projects/demo");
  });

  it("builds a video poster URL at frame 0", () => {
    const url = cloudVideoPosterUrl("portfolio/projects/demo", 1280);
    expect(url).toContain("so_0");
    expect(url).toContain("w_1280");
    expect(url).toEndWith(".jpg");
  });

  it("builds a valid base64 SVG placeholder from a dominant color", () => {
    const placeholder = dominantColorPlaceholder("#0066FF");
    expect(placeholder).toStartWith("data:image/svg+xml;base64,");
    const decoded = Buffer.from(
      placeholder.replace("data:image/svg+xml;base64,", ""),
      "base64"
    ).toString("utf8");
    expect(decoded).toContain("#0066FF");
  });

  it("resolves full URLs and public IDs safely with resolveMediaUrl", () => {
    // Absolute URLs return untouched
    expect(resolveMediaUrl("https://images.unsplash.com/photo-123")).toBe(
      "https://images.unsplash.com/photo-123"
    );
    expect(resolveMediaUrl("/placeholder.png")).toBe("/placeholder.png");

    // Cloudinary public ID returns transformed Cloudinary URL
    const resolved = resolveMediaUrl("portfolio/media/zfyvma4czaxdbddax4qi");
    expect(resolved).toContain("portfolio/media/zfyvma4czaxdbddax4qi");
    expect(resolved).toStartWith("https://res.cloudinary.com/");

    // Empty / null returns empty string
    expect(resolveMediaUrl(null)).toBe("");
    expect(resolveMediaUrl("")).toBe("");
  });
});

