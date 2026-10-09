import * as React from "react";
import { MediaUploader } from "@/components/admin/media-uploader";
import { MediaLibraryClient } from "@/components/admin/media-library-client";
import { getAllMediaAssets } from "@/lib/db/queries/media";

export default async function AdminMediaPage() {
  const rawAssets = await getAllMediaAssets();

  const assets = rawAssets.map((a) => ({
    id: a.id,
    publicId: a.publicId,
    type: a.type as "image" | "video",
    width: a.width,
    height: a.height,
    format: a.format,
    bytes: a.bytes,
    altText: a.altText,
    dominantColor: a.dominantColor ?? undefined,
  }));

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="border border-border bg-surface p-6 space-y-1">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Asset Management
        </span>
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Media Library
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload images and videos. All files are delivered via Cloudinary with
          automatic format optimisation.
        </p>
      </div>

      {/* Uploader */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Upload New Files
        </h3>
        <MediaUploader
          folder="portfolio/media"
          resourceType="auto"
          maxFiles={20}
          maxFileSizeMb={100}
        />
      </div>

      {/* Library Grid */}
      <div className="border border-border bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            All Assets ({assets.length})
          </h3>
        </div>
        <MediaLibraryClient initialAssets={assets} />
      </div>
    </div>
  );
}
