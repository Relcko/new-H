"use client";

import { useThreeSceneStore } from "@/lib/three/scene-store";
import type { QualityPreset, QualityTier } from "@/lib/three/quality";

/** Currently-applied quality tier (mirrors QualityManager decision). */
export function useQuality(): QualityTier {
  return useThreeSceneStore((s) => s.quality);
}

export function useQualityPreset(): QualityPreset {
  return useThreeSceneStore((s) => s.preset);
}

/** Engine-ready flag (canvas mounted and renderer configured). */
export function useThreeReady(): boolean {
  return useThreeSceneStore((s) => s.ready);
}

/** Currently-active 3D scene id. */
export function useActiveScene(): string | null {
  return useThreeSceneStore((s) => s.activeSceneId);
}

/** Engine camera state (smoothed progress + parallax + mode). */
export function useEngineCamera() {
  return useThreeSceneStore((s) => s.camera);
}

/** Convenience setter for switching the current camera `mode`. */
export function useSetCameraMode() {
  const setCamera = useThreeSceneStore((s) => s.setCamera);
  return (mode: string) => setCamera({ mode });
}