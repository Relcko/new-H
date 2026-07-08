"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * CameraPath — produces a sampled catmull-rom path through provided points.
 * Page scenes read `path.getPoint(t)` to position cameras/look-at along a
 * cinematic dolly. Pure data helper; no per-frame work is built in.
 */
export function useCameraPath(
  points: Array<[number, number, number]>,
  closed = false,
): THREE.CatmullRomCurve3 {
  return useMemo(() => {
    const v3 = points.map((p) => new THREE.Vector3(...p));
    return new THREE.CatmullRomCurve3(v3, closed, "catmullrom", 0.5);
  }, [points, closed]);
}