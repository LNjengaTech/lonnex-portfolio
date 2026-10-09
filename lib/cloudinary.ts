import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generates a signed upload signature for direct browser → Cloudinary uploads.
 */
export async function getUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = {
    folder,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}

/**
 * Fetches the dominant colour for a Cloudinary image.
 */
export async function getDominantColor(publicId: string): Promise<string | null> {
  try {
    const result = await cloudinary.api.resource(publicId, {
      colors: true,
    });
    const colors = result.colors as Array<[string, number]>;
    return colors?.[0]?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Safely deletes a Cloudinary resource by public_id.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" = "image"
): Promise<boolean> {
  try {
    // 1. Primary: Cloudinary Admin API (server-authenticated, supports images and videos)
    const adminRes = await cloudinary.api.delete_resources([publicId], {
      resource_type: resourceType,
      type: "upload",
      invalidate: true,
    });
    const status = adminRes.deleted?.[publicId];
    if (status === "deleted" || status === "not_found") {
      return true;
    }
  } catch (adminErr) {
    console.warn("[Cloudinary Admin API Delete Warning]:", adminErr);
  }

  try {
    // 2. Fallback: Cloudinary Uploader destroy
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return res.result === "ok" || res.result === "not found";
  } catch (error) {
    console.error("[Cloudinary Destroy Error]:", error);
    return false;
  }
}

/**
 * Builds a Cloudinary delivery URL with f_auto and q_auto optimizations.
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    resourceType?: "image" | "video";
  } = {}
): string {
  const { width, height, crop = "fill", resourceType = "image" } = options;
  return cloudinary.url(publicId, {
    resource_type: resourceType,
    fetch_format: "auto",
    quality: "auto",
    width,
    height,
    crop,
    secure: true,
  });
}

export { cloudinary };
