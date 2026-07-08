import type { QualityTier } from "./quality";
import type { QualityPreset } from "./quality";

/**
 * Shared 3D-scene Zustand slice. Holds the *engine* state — not anything
 * page-specific. Scene modules read the active quality preset, paused state,
 * and active id through this store via `useThreeSceneStore`.
 *
 * Reuses the existing `useSceneStore.reducedMotion/paused` for cross-cutting
 * concerns; this store adds quality + active scene + camera target plumbing.
 */
import { create } from "zustand";
import { QUALITY_PRESETS } from "./quality";

export interface CameraState {
  /** Smoothed scroll-driven position in [0,1]. */
  progress: number;
  /** Smoothed pointer offset in [-1, 1] on each axis. */
  parallax: [number, number];
  /** Optional named target an attached scene has claimed. */
  mode: string;
}

interface ThreeSceneState {
  quality: QualityTier;
  preset: QualityPreset;
  setQuality: (q: QualityTier) => void;

  /** Active scene id — used to arbitrate which scene owns the camera. */
  activeSceneId: string | null;
  setActiveScene: (id: string | null) => void;

  camera: CameraState;
  setCamera: (next: Partial<CameraState>) => void;

  /** Engine is awake and a canvas has mounted. */
  ready: boolean;
  setReady: (r: boolean) => void;

  sceneEvent: { name: string; t: number } | null;
  emitSceneEvent: (name: string) => void;
}

export const useThreeSceneStore = create<ThreeSceneState>((set) => ({
  quality: "high",
  preset: QUALITY_PRESETS.high,
  setQuality: (quality) =>
    set({ quality, preset: QUALITY_PRESETS[quality] }),

  activeSceneId: null,
  setActiveScene: (activeSceneId) => set({ activeSceneId }),

  camera: { progress: 0, parallax: [0, 0], mode: "idle" },
  setCamera: (next) =>
    set((s) => ({ camera: { ...s.camera, ...next } })),

  ready: false,
  setReady: (ready) => set({ ready }),

  sceneEvent: null,
  emitSceneEvent: (name) =>
    set({ sceneEvent: { name, t: performance.now() } }),
}));