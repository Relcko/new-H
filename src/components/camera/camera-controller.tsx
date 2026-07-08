"use client";
/* eslint-disable react-hooks/immutability -- R3F cameras are mutated per
   frame by design; damping writes are the canonical R3F pattern. */

import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRef } from "react";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { damp } from "@/lib/utils";

/**
 * CameraController — drives the active camera with a smoothed, scroll- and
 * pointer-reactive transform. Reads `camera.progress` and `camera.parallax`
 * from the engine store and writes to the camera every frame.
 *
 * `behaviors` is a page-supplied record mapping named modes to position/target
 * closures; the controller picks the named mode. No page-specific behavior
 * lives in this file.
 */
export interface CameraBehavior {
  position: (p: number, parallax: [number, number]) => [number, number, number];
  target: (p: number, parallax: [number, number]) => [number, number, number];
}

export interface CameraControllerProps {
  behaviors: Record<string, CameraBehavior>;
  lambda?: number;
  activeSceneId?: string;
}

export function CameraController({
  behaviors,
  lambda = 4,
  activeSceneId,
}: CameraControllerProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const sceneState = useThreeSceneStore((s) => s.camera);
  const activeId = useThreeSceneStore((s) => s.activeSceneId);
  const targetPos = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const up = useRef(new THREE.Vector3(0, 1, 0));
  const m = useRef(new THREE.Matrix4());
  const q = useRef(new THREE.Quaternion());

  useFrame((_, delta) => {
    if (activeSceneId && activeId !== activeSceneId) return;
    const behavior = behaviors[sceneState.mode] ?? behaviors["default"];
    if (!behavior) return;

    const p = sceneState.progress;
    const par = sceneState.parallax;
    const desiredPos = behavior.position(p, par);
    const desiredTarget = behavior.target(p, par);

    targetPos.current.set(...desiredPos);
    lookAt.current.set(...desiredTarget);

    const d = Math.min(delta, 1 / 30);
    camera.position.x = damp(camera.position.x, targetPos.current.x, lambda, d);
    camera.position.y = damp(camera.position.y, targetPos.current.y, lambda, d);
    camera.position.z = damp(camera.position.z, targetPos.current.z, lambda, d);

    m.current.lookAt(camera.position, lookAt.current, up.current);
    q.current.setFromRotationMatrix(m.current);
    camera.quaternion.slerp(q.current, Math.min(1, lambda * d));
  });

  return null;
}