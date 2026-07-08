"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { useDevStore } from "@/stores/dev-store";

/**
 * DevCameraBridge — lives inside the R3F canvas, reads the active camera's
 * transform every ~200 ms, and writes it to the dev store. Renders null.
 *
 * Throttled so it doesn't add per-frame overhead to the dev experience.
 */
export function DevCameraBridge() {
  const camera = useThree((s) => s.camera);
  const setCameraTransform = useDevStore((s) => s.setCameraTransform);
  const lastWrite = useRef(0);

  useFrame(() => {
    const now = performance.now();
    if (now - lastWrite.current < 200) return;
    lastWrite.current = now;
    setCameraTransform({
      position: [camera.position.x, camera.position.y, camera.position.z],
      rotation: [
        camera.rotation.x,
        camera.rotation.y,
        camera.rotation.z,
      ],
      fov: (camera as { fov?: number }).fov ?? 0,
    });
  });

  return null;
}
