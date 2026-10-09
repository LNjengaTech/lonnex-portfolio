"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface CloudImageProps {
  publicId: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  /** Dominant color hex string for LCP placeholder */
  dominantColor?: string;
  /** Cloudinary crop mode */
  crop?: "fill" | "fit" | "scale" | "crop" | "thumb";
  sizes?: string;
}

function buildUrl(
  publicId: string,
  width: number,
  height: number,
  crop: string
): string {
  // If publicId is already a full URL, return it directly
  if (publicId.startsWith("http://") || publicId.startsWith("https://") || publicId.startsWith("/")) {
    return publicId;
  }
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_${crop},w_${width},h_${height}/${publicId}`;
}

export function CloudImage({
  publicId,
  alt,
  width,
  height,
  className,
  fill = false,
  priority = false,
  dominantColor,
  crop = "fill",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: CloudImageProps) {
  const [hasError, setHasError] = React.useState(false);

  if (!CLOUD_NAME || hasError) {
    return (
      <div
        className={cn(
          "bg-surface border border-border flex flex-col items-center justify-center text-muted-foreground p-2",
          className
        )}
        style={
          fill
            ? { position: "absolute", inset: 0 }
            : { width, height }
        }
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-5 w-5 opacity-40 mb-1" />
        <span className="font-mono text-[9px] uppercase tracking-wider opacity-60 truncate max-w-full">
          {alt || "Image"}
        </span>
      </div>
    );
  }

  const src = buildUrl(publicId, width, height, crop);

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      sizes={sizes}
      unoptimized
      onError={() => setHasError(true)}
      className={className}
      placeholder={dominantColor ? "blur" : "empty"}
      blurDataURL={
        dominantColor
          ? `data:image/svg+xml;base64,${Buffer.from(
              `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="${dominantColor}"/></svg>`
            ).toString("base64")}`
          : undefined
      }
      style={{ objectFit: "cover" }}
    />
  );
}

