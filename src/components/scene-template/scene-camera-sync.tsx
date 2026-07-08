"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useScrollStore } from "@/stores/scroll-store";
import { damp } from "@/lib/utils";

/**
 * SceneCameraSync — bridges page scroll + R3F pointer into the engine's camera
 * state (progress + parallax + mode). Runs inside the canvas. Generalizes the
 * hero's camera sync so every scene gets the same scroll/parallax wiring.
 *
 * A short "arrival" intro ramps progress 0 → (1 - scrollWeight) over
 * `introDuration` seconds so the camera dollies forward on mount; the
 * remaining `scrollWeight` of the dolly is scroll-driven. Writes are throttled
 * by an epsilon so idle frames don't churn store subscribers.
 *
 * Pure infrastructure — only writes to the engine camera slice; no scene
 * content.
 */
export interface SceneCameraSyncProps {
  /** Scene id; sync only writes while this scene owns the camera. */
  sceneId: string;
  /** Camera mode to claim on mount (defaults to the scene id). */
  activeMode?: string;
  /** Scroll-progress weight (0–1). Default 0.6. */
  scrollWeight?: number;
  /** Intro ramp duration in seconds. Default 2.4. */
  introDuration?: number;
  /** Pointer-parallax damping. Default 2.5. */
  parallaxLambda?: number;
}

export function SceneCameraSync({
  sceneId,
  activeMode,
  scrollWeight = 0.6,
  introDuration = 2.4,
  parallaxLambda = 2.5,
}: SceneCameraSyncProps) {
  const setCamera = useThreeSceneStore((s) => s.setCamera);
  const activeId = useThreeSceneStore((s) => s.activeSceneId);
  const intro = useRef(0);
  const par = useRef<[number, number]>([0, 0]);
  const last = useRef({ p: -1, px: -1, py: -1 });
  const mode = activeMode ?? sceneId;

  useEffect(() => {
    setCamera({ mode });
  }, [mode, setCamera]);

  useFrame((state, delta) => {
    // Only the active scene drives the camera — avoids cross-scene contention.
    if (activeId !== sceneId) return;

    intro.current = Math.min(
      1,
      intro.current + delta / Math.max(introDuration, 0.001),
    );
    const scrollP = useScrollStore.getState().progress;
    const p = intro.current * (1 - scrollWeight) + scrollP * scrollWeight;

    par.current[0] = damp(par.current[0], state.pointer.x, parallaxLambda, delta);
    par.current[1] = damp(par.current[1], state.pointer.y, parallaxLambda, delta);

    const lp = last.current;
    if (
      Math.abs(p - lp.p) > 0.0005 ||
      Math.abs(par.current[0] - lp.px) > 0.0005 ||
      Math.abs(par.current[1] - lp.py) > 0.0005
    ) {
      lp.p = p;
      lp.px = par.current[0];
      lp.py = par.current[1];
      setCamera({
        progress: p,
        parallax: [par.current[0], par.current[1]],
        mode,
      });
    }
  });

  return null;
}
