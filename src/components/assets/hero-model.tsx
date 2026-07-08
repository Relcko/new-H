"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useGLTFAsset } from "@/components/assets/assets";
import { AssetManager } from "@/lib/asset-manifest";
import { CanvasErrorBoundary } from "@/components/canvas/canvas-error-boundary";

export interface HeroModelProps {
  /** Fallback geometry rendered while the model loads or when no GLB exists. */
  fallback?: ReactNode;
  /** Position / scale / rotation passed to the loaded model's root scene. */
  position?: [number, number, number];
  scale?: number | [number, number, number];
  rotation?: [number, number, number];
}

/**
 * HeroModel — reusable GLB model loader for the Hero scene. Reads the asset
 * manifest to determine whether a production model exists. If the manifest
 * entry is null, renders the fallback geometry instead.
 *
 * To activate: set `hero.model` to a path string in assets-manifest.json and
 * drop the Draco-compressed GLB into `/public/assets/models/`. No code
 * changes needed.
 */
export function HeroModel({
  fallback = <DefaultMonolith />,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
}: HeroModelProps) {
  const [modelPath, setModelPath] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    AssetManager.load().then(() => {
      if (!cancelled) setModelPath(AssetManager.get("hero", "model"));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!modelPath) {
    return <>{fallback}</>;
  }

  return (
    <CanvasErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <LoadedModel
          path={modelPath}
          cacheKey="hero-model"
          position={position}
          scale={scale}
          rotation={rotation}
        />
      </Suspense>
    </CanvasErrorBoundary>
  );
}

/** Inner loader that calls useGLTFAsset — isolated so Suspense catches it. */
function LoadedModel({
  path,
  cacheKey,
  position,
  scale,
  rotation,
}: {
  path: string;
  cacheKey: string;
  position: [number, number, number];
  scale: number | [number, number, number];
  rotation: [number, number, number];
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

/**
 * Default fallback — a simple architectural monolith. Placeholder for the
 * production GLB that will be created externally.
 */
function DefaultMonolith() {
  return (
    <mesh position={[0, 4, 0]} castShadow>
      <boxGeometry args={[1.2, 8, 1.2]} />
      <meshPhysicalMaterial
        color="#0a0d14"
        metalness={0.2}
        roughness={0.15}
        transmission={0.4}
        ior={1.4}
        thickness={1.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        emissive="#c9b299"
        emissiveIntensity={0.05}
        envMapIntensity={1.5}
        transparent
      />
    </mesh>
  );
}
