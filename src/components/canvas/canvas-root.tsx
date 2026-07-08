"use client";

import { useEffect, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import * as THREE from "three";
import { CanvasErrorBoundary } from "./canvas-error-boundary";
import { CanvasProvider } from "./canvas-provider";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useSceneStore } from "@/stores/scene-store";
import { useAssetCache } from "@/lib/three/asset-cache";
import { PerformanceMonitor } from "./performance-monitor";
import { QualityManager } from "./quality-manager";
import { RendererManager } from "./renderer-manager";
import { AssetLoaderConfig } from "@/components/assets/asset-loader-config";

/**
 * CanvasRoot — the single R3F `<Canvas>` for the entire marketing surface.
 *
 * Responsibilities (engine-only):
 *   • Tone mapping, color space, power preference — set once here.
 *   • Adaptive DPR (PerformanceMonitor shrinks/exposes the dpr band on drops).
 *   • Initial quality classification via `<QualityManager/>`, mirroring the
 *     reduced-motion handshake inside the canvas.
 *   • Renderer configuration via `<RendererManager/>`, kept in sync with the
 *     active QualityPreset (shadows, exposure).
 *   • DRACO/KTX2 decoder bootstrap via `<AssetLoaderConfig/>`.
 *   • Disposes the renderer output + shared asset cache on unmount.
 *
 * Page scenes mount children (e.g. `<Scene3D id="..."/>`) directly; the engine
 * never contains page content.
 */
export interface CanvasRootProps
  extends Omit<CanvasProps, "children" | "gl" | "dpr"> {
  children: ReactNode;
  /** Fallback shown when WebGL is unavailable. */
  fallback?: ReactNode;
}

export function CanvasRoot({
  children,
  fallback,
  ...canvasProps
}: CanvasRootProps) {
  const setReady = useThreeSceneStore((s) => s.setReady);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const clearCache = useAssetCache((s) => s.clear);

  // Dispose the shared GPU asset cache on unmount (page scene teardown).
  useEffect(() => () => clearCache(), [clearCache]);

  return (
    <CanvasErrorBoundary fallback={fallback}>
      <Canvas
        frameloop="always"
        resize={{ scroll: false, debounce: { scroll: 0, resize: 0 } }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          premultipliedAlpha: true,
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          clearColor: new THREE.Color("#050608"),
          clearAlpha: 0,
        } as unknown as THREE.WebGLRendererParameters}
        onCreated={({ gl }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          setReady(true);
        }}
        dpr={[0.5, 2]}
        {...canvasProps}
      >
        <QualityManager />
        <PerformanceMonitor />
        <RendererManager />
        <AssetLoaderConfig />
        <CanvasProvider canvasId="root" ready={true}>
          {reducedMotion ? null : children}
        </CanvasProvider>
      </Canvas>
    </CanvasErrorBoundary>
  );
}