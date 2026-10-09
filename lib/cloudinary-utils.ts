/**
 * Cloudinary URL builder utilities — shared, importable anywhere.
 * Only pure functions: no SDK calls (safe for edge/client/server).
 */

const CLOUD_NAME =
  typeof process !== "undefined"
    ? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    : "";

/**
 * Builds an optimised Cloudinary image URL.
 */
export function cloudImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "crop" | "thumb";
    quality?: "auto" | number;
  } = {}
): string {
  const { width, height, crop = "fill", quality = "auto" } = options;
  const transforms = [
    "f_auto",
    `q_${quality}`,
    crop && `c_${crop}`,
    width && `w_${width}`,
    height && `h_${height}`,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}

/**
 * Builds an optimised Cloudinary video URL.
 */
export function cloudVideoUrl(publicId: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${publicId}`;
}

/**
 * Builds a still poster from a video asset (frame at 0 seconds).
 */
export function cloudVideoPosterUrl(publicId: string, width = 1280): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto,c_fill,w_${width},so_0/${publicId}.jpg`;
}

/**
 * Builds a dominant-color SVG base64 data URI for use as a blur placeholder.
 */
export function dominantColorPlaceholder(hex: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="${hex}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * Safely resolves a media identifier (URL or Cloudinary public ID) to an absolute URL.
 * Prevents relative URL requests that cause 404s (e.g. /admin/portfolio/media/...).
 */
export function resolveMediaUrl(
  urlOrPublicId?: string | null,
  options?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "crop" | "thumb";
    quality?: "auto" | number;
    type?: "image" | "video";
  }
): string {
  if (!urlOrPublicId) return "";
  const trimmed = urlOrPublicId.trim();
  if (!trimmed) return "";
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }
  if (options?.type === "video") {
    return cloudVideoUrl(trimmed);
  }
  return cloudImageUrl(trimmed, options);
}

