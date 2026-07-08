"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Environment, Sky } from "@react-three/drei";
import { useGLTFAsset } from "@/components/assets";
import { CanvasErrorBoundary } from "@/components/canvas";
import { AssetManager, type AssetKind } from "@/lib/asset-manifest";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useSceneStore } from "@/stores/scene-store";
import { cn } from "@/lib/cn";
import type { Vec3, EnvironmentPresetName } from "./types";

/**
 * Google Flow asset placeholders — manifest-driven, scene-generic loaders for
 * production 3D/video/HDRI assets. Each reads the asset manifest by *scene id*
 * (not a hardcoded "hero"), so every scene using SceneTemplate gets the same
 * drop-in activation path:
 *
 *   1. Drop the file into the matching `/public/assets/*` folder.
 *   2. Set its path string in assets-manifest.json under the scene id.
 *   3. No component code changes — the placeholder resolves it at runtime.
 *
 * While a path is `null` (or still loading), the consumer-provided `fallback`
 * (or nothing) is rendered, so the page always has a coherent shape.
 */

/* ---- Model --------------------------------------------------------------- */

export interface SceneModelPlaceholderProps {
  sceneId: string;
  manifestKey?: AssetKind;
  position?: Vec3;
  scale?: number | Vec3;
  rotation?: Vec3;
  fallback?: ReactNode;
}

export function SceneModelPlaceholder({
  sceneId,
  manifestKey = "model",
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  fallback = null,
}: SceneModelPlaceholderProps) {
  const [modelPath, setModelPath] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    AssetManager.load().then(() => {
      if (!cancelled) setModelPath(AssetManager.get(sceneId, manifestKey));
    });
    return () => {
      cancelled = true;
    };
  }, [sceneId, manifestKey]);

  if (!modelPath) return <>{fallback}</>;

  return (
    <CanvasErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <LoadedModel
          path={modelPath}
          cacheKey={`${sceneId}-model`}
          position={position}
          scale={scale}
          rotation={rotation}
        />
      </Suspense>
    </CanvasErrorBoundary>
  );
}

/** Inner loader isolated so Suspense catches the async GLTF parse. */
function LoadedModel({
  path,
  cacheKey,
  position,
  scale,
  rotation,
}: {
  path: string;
  cacheKey: string;
  position: Vec3;
  scale: number | Vec3;
  rotation: Vec3;
}) {
  const gltf = useGLTFAsset(path, cacheKey);
  const scene = Array.isArray(gltf) ? gltf[0].scene : gltf.scene;
  return (
    <primitive
      object={scene}
      position={position}
      scale={scale}
      rotation={rotation as never}
    />
  );
}

/* ---- Environment --------------------------------------------------------- */

export interface SceneEnvironmentPlaceholderProps {
  sceneId: string;
  manifestKey?: AssetKind;
  preset?: EnvironmentPresetName;
  /** Explicit HDR path (overrides preset + manifest). */
  files?: string;
  background?: boolean;
  sky?: boolean;
  fog?: { color: string; near: number; far: number };
  children?: ReactNode;
}

export function SceneEnvironmentPlaceholder({
  sceneId,
  manifestKey = "environment",
  preset = "night",
  files,
  background = false,
  sky = false,
  fog,
  children,
}: SceneEnvironmentPlaceholderProps) {
  // `files` wins synchronously; the manifest is only probed when no explicit
  // file is given. Keeping the two paths separate avoids a synchronous
  // setState-in-effect — the manifest resolve happens in an async callback.
  const [manifestHdr, setManifestHdr] = useState<string | null>(null);
  const hdrPath = files ?? manifestHdr;
  const envResolution = useThreeSceneStore((s) => s.preset.envResolution);

  useEffect(() => {
    if (files) return;
    let cancelled = false;
    AssetManager.load().then(() => {
      if (!cancelled) setManifestHdr(AssetManager.get(sceneId, manifestKey));
    });
    return () => {
      cancelled = true;
    };
  }, [sceneId, manifestKey, files]);

  return (
    <>
      {fog && <fog attach="fog" args={[fog.color, fog.near, fog.far]} />}
      {sky && <Sky sunPosition={[0, 0.2, -1]} turbidity={8} rayleigh={2} />}
      <Suspense fallback={null}>
        <Environment
          files={hdrPath ?? undefined}
          preset={hdrPath ? undefined : preset}
          background={background}
          resolution={envResolution}
          frames={1}
        />
      </Suspense>
      {children}
    </>
  );
}

/* ---- Video (DOM layer — above canvas, below overlay) --------------------- */

export interface SceneVideoPlaceholderProps {
  sceneId: string;
  manifestKey?: AssetKind;
  /** Poster image; also shown under reduced-motion. */
  poster?: string;
  className?: string;
  fallback?: ReactNode;
  autoPlay?: boolean;
}

export function SceneVideoPlaceholder({
  sceneId,
  manifestKey = "video",
  poster,
  className,
  fallback = null,
  autoPlay = true,
}: SceneVideoPlaceholderProps) {
  const reduced = useSceneStore((s) => s.reducedMotion);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AssetManager.load().then(() => {
      if (!cancelled) setVideoPath(AssetManager.get(sceneId, manifestKey));
    });
    return () => {
      cancelled = true;
    };
  }, [sceneId, manifestKey]);

  const mime = videoPath ? guessVideoMime(videoPath) : undefined;

  const posterEl = poster ? (
    <div
      className={cn("absolute inset-0 bg-cover bg-center", className)}
      style={{ backgroundImage: `url(${poster})` }}
      aria-hidden
    />
  ) : (
    <>{fallback}</>
  );

  // Reduced-motion or no production video → static poster/fallback.
  if (reduced || !videoPath) return <>{posterEl}</>;

  return (
    <video
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
      poster={poster ?? undefined}
      onLoadedData={() => setLoaded(true)}
      aria-hidden
    >
      <source src={videoPath} type={mime} />
    </video>
  );
}

function guessVideoMime(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "webm") return "video/webm";
  if (ext === "ogg" || ext === "ogv") return "video/ogg";
  return "video/mp4";
}
