"use client";

import { useEffect, useRef, useState } from "react";
import { AssetManager } from "@/lib/asset-manifest";
import { ASSET_PATHS, type VideoAssetPaths } from "@/config/assets";
import { useSceneStore } from "@/stores/scene-store";
import { cn } from "@/lib/cn";

export interface HeroVideoProps {
  /** Override the default paths from ASSET_PATHS.hero.video. */
  paths?: VideoAssetPaths;
  /** Element to render when no video asset exists (procedural fallback). */
  fallback?: React.ReactNode;
  className?: string;
  /** Auto-play (muted, looped, playsInline — required for mobile autoplay). */
  autoPlay?: boolean;
}

/**
 * HeroVideo — reusable cinematic video layer. Reads the asset manifest to
 * determine whether a production video exists. If the manifest entry is null,
 * renders the fallback (or null) so the procedural canvas shows through.
 *
 * To activate: set `hero.video` to a path string in assets-manifest.json and
 * drop the file into `/public/assets/videos/`. No code changes needed.
 *
 * Reduced-motion: video is not mounted; the poster (if manifest declares one)
 * or the fallback is shown instead.
 */
export function HeroVideo({
  paths = ASSET_PATHS.hero.video,
  fallback = null,
  className,
  autoPlay = true,
}: HeroVideoProps) {
  const reduced = useSceneStore((s) => s.reducedMotion);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [posterPath, setPosterPath] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AssetManager.load().then(() => {
      if (cancelled) return;
      // Manifest declares the video path as a string, or null for fallback.
      const mv = AssetManager.get("hero", "video");
      setVideoPath(mv);
      // Poster comes from the config paths — it's an image, not a separate
      // manifest entry. We check if the manifest has a "video" entry; if so,
      // the poster path from config is used; otherwise we stay null.
      if (mv && paths.poster) setPosterPath(paths.poster);
    });
    return () => {
      cancelled = true;
    };
  }, [paths.poster]);

  if (reduced) {
    if (posterPath) {
      return (
        <div
          className={cn("absolute inset-0 bg-cover bg-center", className)}
          style={{ backgroundImage: `url(${posterPath})` }}
          aria-hidden
        />
      );
    }
    return <>{fallback}</>;
  }

  if (!videoPath) {
    if (posterPath) {
      return (
        <div
          className={cn("absolute inset-0 bg-cover bg-center", className)}
          style={{ backgroundImage: `url(${posterPath})` }}
          aria-hidden
        />
      );
    }
    return <>{fallback}</>;
  }

  return (
    <video
      ref={videoRef}
      className={cn(
        "absolute inset-0 h-full w-full object-cover",
        !loaded && "opacity-0",
        loaded && "opacity-100 transition-opacity duration-1000",
        className,
      )}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
      poster={posterPath ?? undefined}
      onLoadedData={() => setLoaded(true)}
      aria-hidden
    >
      {paths.webm && <source src={paths.webm} type="video/webm" />}
      {paths.mp4 && <source src={paths.mp4} type="video/mp4" />}
    </video>
  );
}
