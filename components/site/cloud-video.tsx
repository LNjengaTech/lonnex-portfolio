"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { HEX_CLIP_PATH } from "@/lib/hex";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface CloudVideoProps {
  publicId: string;
  /** Width in pixels — used to derive srcset and poster */
  width: number;
  height: number;
  /** Accessible label */
  label: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  /** Dominant color for poster placeholder */
  dominantColor?: string;
}

function buildVideoUrl(publicId: string, quality = "auto"): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_${quality}/${publicId}`;
}

function buildPosterUrl(publicId: string, width: number): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto,c_fill,w_${width},so_0/${publicId}.jpg`;
}

export function CloudVideo({
  publicId,
  width,
  height,
  label,
  className,
  autoPlay = false,
  loop = true,
  muted = true,
  controls = false,
  dominantColor,
}: CloudVideoProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(autoPlay);
  const [loaded, setLoaded] = React.useState(false);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  if (!CLOUD_NAME) {
    return (
      <div
        className={cn("bg-border", className)}
        style={{ width, height, aspectRatio: `${width}/${height}` }}
        aria-label={label}
        role="img"
      />
    );
  }

  const src = buildVideoUrl(publicId);
  const poster = buildPosterUrl(publicId, width);

  return (
    <div
      className={cn("relative overflow-hidden bg-background", className)}
      style={{ aspectRatio: `${width}/${height}` }}
    >
      {/* Dominant colour placeholder */}
      {!loaded && dominantColor && (
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ backgroundColor: dominantColor, opacity: loaded ? 0 : 1 }}
        />
      )}

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        width={width}
        height={height}
        loop={loop}
        muted={muted}
        autoPlay={autoPlay}
        playsInline
        aria-label={label}
        className="h-full w-full object-cover transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0 }}
        onCanPlayThrough={() => setLoaded(true)}
      />

      {/* Custom Play/Pause Overlay — only if controls is false */}
      {!controls && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause video" : "Play video"}
          className={cn(
            "absolute bottom-3 right-3 flex h-9 w-8 items-center justify-center bg-background/70 text-foreground transition-opacity hover:bg-background cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
          style={{ clipPath: HEX_CLIP_PATH }}
        >
          {playing ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}
