"use client";

import { useEffect, type ReactNode } from "react";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import type { CameraState } from "@/lib/three/scene-store";

/**
 * CameraTarget — declaratively sets the engine's camera state from a child
 * scene. Use it to flip the camera into a named `mode` and seed `progress` /
 * `parallax` without running an animation. (For live-driven motion pair with
 * `CameraController` and write to the same store.)
 */
export interface CameraTargetProps {
  mode?: string;
  progress?: number;
  parallax?: [number, number];
  children?: ReactNode;
}

export function CameraTarget({
  mode,
  progress,
  parallax,
  children,
}: CameraTargetProps) {
  const setCamera = useThreeSceneStore((s) => s.setCamera);
  useEffect(() => {
    const next: Partial<CameraState> = {};
    if (mode !== undefined) next.mode = mode;
    if (progress !== undefined) next.progress = progress;
    if (parallax !== undefined) next.parallax = parallax;
    setCamera(next);
    // Missing deps intentional — we only react to actual value changes.
  }, [mode, progress, parallax, setCamera]);

  return <>{children}</>;
}