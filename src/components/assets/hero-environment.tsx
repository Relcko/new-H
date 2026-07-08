"use client";

import { useEffect, useState, type ReactNode, Suspense } from "react";
import { Environment } from "@react-three/drei";
import { AssetManager } from "@/lib/asset-manifest";
import { useThreeSceneStore } from "@/lib/three/scene-store";

export interface HeroEnvironmentProps {
  /**
   * Fallback preset to use when no HDR file exists in the manifest. Uses
   * drei's built-in presets (no external file needed). Defaults to "night".
   */
  fallbackPreset?: "city" | "studio" | "sunset" | "night" | "warehouse" | "dawn";
  /** Optional fog configuration. */
  fog?: { color: string; near: number; far: number };
  /** Whether to use the environment as the visible background. */
  background?: boolean;
  children?: ReactNode;
}

/**
 * HeroEnvironment — reusable HDR environment loader. Reads the asset manifest
 * to determine whether a custom HDR file exists. If the manifest entry is
 * null, falls back to a drei preset so the scene always has image-based
 * lighting.
 *
 * To activate: set `hero.environment` to a path string in assets-manifest.json
 * and drop a PMREM-friendly .hdr into `/public/assets/hdr/`. No code changes
 * needed.
 */
export function HeroEnvironment({
  fallbackPreset = "night",
  fog,
  background = false,
  children,
}: HeroEnvironmentProps) {
  const [hdrPath, setHdrPath] = useState<string | null>(null);
  const envResolution = useThreeSceneStore((s) => s.preset.envResolution);

  useEffect(() => {
    let cancelled = false;
    AssetManager.load().then(() => {
      if (!cancelled) setHdrPath(AssetManager.get("hero", "environment"));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      {fog && <fog attach="fog" args={[fog.color, fog.near, fog.far]} />}

      <Suspense fallback={null}>
        {hdrPath ? (
          <Environment
            files={hdrPath}
            background={background}
            resolution={envResolution}
            frames={1}
          />
        ) : (
          <Environment
            preset={fallbackPreset}
            background={background}
            resolution={envResolution}
            frames={1}
          />
        )}
      </Suspense>

      {children}
    </>
  );
}
