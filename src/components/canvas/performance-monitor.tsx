"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { QualityTier } from "@/lib/three/quality";
import { useThreeSceneStore } from "@/lib/three/scene-store";

/**
 * Adaptive DPR + quality downshifter. Uses R3F's `useFrame` delta to compute a
 * rolling FPS estimate, stepping quality down at < 30 FPS and upgrading
 * cautiously after sustained (>55 FPS for ~3 s) recovery.
 *
 * Renders nothing — runs inside the canvas.
 */
export function PerformanceMonitor() {
  const gl = useThree((s) => s.gl);
  const preset = useThreeSceneStore((s) => s.preset);
  const setQuality = useThreeSceneStore((s) => s.setQuality);
  const quality = useThreeSceneStore((s) => s.quality);
  const stats = useRef({ acc: 0, samples: 0, recoverMs: 0 });

  useEffect(() => {
    gl.setPixelRatio(preset.dpr[1]);
  }, [gl, preset]);

  useFrame((_, delta) => {
    const s = stats.current;
    s.acc += delta;
    s.samples++;
    if (s.acc < 0.5) return;
    const fps = s.samples / s.acc;
    s.acc = 0;
    s.samples = 0;

    const step: Record<QualityTier, QualityTier> = {
      ultra: "high",
      high: "medium",
      medium: "low",
      low: "weak",
      weak: "weak",
    };
    const upgrade: Record<QualityTier, QualityTier> = {
      weak: "low",
      low: "medium",
      medium: "high",
      high: "high",
      ultra: "ultra",
    };

    if (fps < 30) {
      const next = step[quality];
      if (next !== quality) setQuality(next);
    } else if (fps > 55) {
      s.recoverMs += 0.5;
      if (s.recoverMs >= 3) {
        const next = upgrade[quality];
        if (next !== quality) setQuality(next);
        s.recoverMs = 0;
      }
    } else {
      s.recoverMs = 0;
    }
  });

  return null;
}