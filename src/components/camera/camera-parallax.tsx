"use client";

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { damp } from "@/lib/utils";

/**
 * CameraParallax — reads the engine's smoothed pointer offset and applies a
 * subtle damped positional offset to the camera. Independent of (and stacks
 * with) `CameraController`; intended to be a passive ambient drift.
 *
 * Pure infrastructure — no page-specific acceleration.
 */
export interface CameraParallaxProps {
  /** Magnitude in world units. */
  amount?: number;
  /** Damping (higher = snappier). */
  lambda?: number;
  /** Only run when this scene is active. */
  activeSceneId?: string;
}

export function CameraParallax({
  amount = 0.25,
  lambda = 3,
  activeSceneId,
}: CameraParallaxProps) {
  const camera = useThree((s) => s.camera);
  const parallax = useThreeSceneStore((s) => s.camera.parallax);
  const activeId = useThreeSceneStore((s) => s.activeSceneId);
  const offset = useRef(new THREE.Vector3());
  const lastOffset = useRef(new THREE.Vector3());
  const delta = useRef(new THREE.Vector3());

  useFrame((_, dt) => {
    if (activeSceneId && activeId !== activeSceneId) return;
    const targetX = parallax[0] * amount;
    const targetY = parallax[1] * amount;
    const d = Math.min(dt, 1 / 30);
    offset.current.x = damp(offset.current.x, targetX, lambda, d);
    offset.current.y = damp(offset.current.y, targetY, lambda, d);
    delta.current.copy(offset.current).sub(lastOffset.current);
    camera.position.add(delta.current);
    lastOffset.current.copy(offset.current);
  });

  return null;
}