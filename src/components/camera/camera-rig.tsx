"use client";
/* eslint-disable react-hooks/immutability -- R3F cameras are mutated
   intentionally; the rig seeds the baseline transform once. */

import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useRef, type ReactNode } from "react";
import { useThreeSceneStore } from "@/lib/three/scene-store";

/**
 * CameraRig — owns the shared `PerspectiveCamera` and applies a baseline
 * transform. The companion `CameraController` reads progress/parallax from the
 * engine store and writes a smoothed transform over this baseline every frame.
 */
export interface CameraRigProps {
  distance?: number;
  fov?: number;
  position?: [number, number, number];
  target?: [number, number, number];
  children?: ReactNode;
}

export function CameraRig({
  distance = 6,
  fov = 32,
  position = [0, 0, distance],
  target = [0, 0, 0],
  children,
}: CameraRigProps) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const setActiveScene = useThreeSceneStore((s) => s.setActiveScene);
  const setCamera = useThreeSceneStore((s) => s.setCamera);
  const tmp = useRef(new THREE.Vector3());

  useEffect(() => {
    camera.fov = fov;
    camera.updateProjectionMatrix();
    camera.position.set(...position);
    camera.lookAt(tmp.current.set(...target));
    setCamera({ mode: "idle", progress: 0, parallax: [0, 0] });
    setActiveScene(camera.uuid);
    return () => {
      if (useThreeSceneStore.getState().activeSceneId === camera.uuid) {
        setActiveScene(null);
      }
    };
  }, [camera, fov, position, target, tmp, setActiveScene, setCamera]);

  return <>{children}</>;
}