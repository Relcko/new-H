"use client";

import { useEffect } from "react";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useSceneStore } from "@/stores/scene-store";
import { classifyInitialQuality } from "@/lib/three/quality";
import { readViewport } from "@/lib/scroll/viewport";
import type { QualityTier } from "@/lib/three/quality";

/**
 * QualityManager — a headless component (renders nothing) that runs once at
 * canvas-mount time to pick the initial quality tier based on device
 * classification, and arbitrates tier changes when reduced-motion changes.
 *
 * Combined with `PerformanceMonitor`'s runtime downgrade/upgrade loop, this
 * gives us both a cold-start heuristic and steady-state adaptation.
 *
 * Pure infrastructure: page scenes never mount this themselves; CanvasRoot
 * does.
 */
export function QualityManager({
  override,
}: {
  override?: QualityTier;
}) {
  const setQuality = useThreeSceneStore((s) => s.setQuality);
  const reduced = useSceneStore((s) => s.reducedMotion);

  useEffect(() => {
    if (override) {
      setQuality(override);
      return;
    }

    // Reduced-motion users always get the lowest 3D tier — but it still
    // mounts (the canvas isn't gone; motion is). Without it the page
    // *structure* collapses.
    if (reduced) {
      setQuality("weak");
      return;
    }

    const vp = readViewport();
    const cores =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & { hardwareConcurrency?: number }).hardwareConcurrency ?? 8
        : 8;
    const memory =
      typeof navigator !== "undefined"
        ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8)
        : 8;
    setQuality(
      classifyInitialQuality({
        isMobile: vp.isMobile,
        isTablet: vp.isTablet,
        dpr: vp.dpr,
        cores,
        memory,
      }),
    );
  }, [override, reduced, setQuality]);

  return null;
}