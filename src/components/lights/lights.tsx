"use client";

import { useLayoutEffect, useRef } from "react";
import { type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { useThreeSceneStore } from "@/lib/three/scene-store";

type LightProps<T extends keyof ThreeElements> = Partial<
  ThreeElements[T]
> & { castShadow?: boolean };

function useShadowMapSize(): number {
  return useThreeSceneStore((s) => s.preset.shadowMapSize);
}

/** Key light — warm directional, casts the primary shadow. */
export function KeyLight({
  intensity = 2.4,
  color = "#fff4e0",
  position = [4, 6, 5],
  castShadow = true,
}: LightProps<"directionalLight">) {
  const shadowSize = useShadowMapSize();
  const ref = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    const l = ref.current;
    if (!l) return;
    if (castShadow && shadowSize > 0) {
      l.castShadow = true;
      l.shadow.mapSize.set(shadowSize, shadowSize);
      l.shadow.bias = -0.0002;
      l.shadow.camera.near = 0.5;
      l.shadow.camera.far = 40;
      l.shadow.camera.left = -10;
      l.shadow.camera.right = 10;
      l.shadow.camera.top = 10;
      l.shadow.camera.bottom = -10;
    } else {
      l.castShadow = false;
    }
  }, [castShadow, shadowSize]);

  return (
    <directionalLight
      ref={ref}
      intensity={intensity}
      color={color}
      position={position}
    />
  );
}

/** Fill light — soft ambient hemisphere to lift shadows. */
export function FillLight({
  intensity = 0.35,
  color = "#2a3245",
  groundColor = "#05060a",
}: LightProps<"hemisphereLight">) {
  return (
    <hemisphereLight
      intensity={intensity}
      color={color}
      groundColor={groundColor}
    />
  );
}

/** Rim light — cool daylight back-light to separate subject from background. */
export function RimLight({
  intensity = 1.6,
  color = "#7fb2ff",
  position = [-6, 4, -5],
}: LightProps<"directionalLight">) {
  return (
    <directionalLight
      intensity={intensity}
      color={color}
      position={position}
    />
  );
}

/** Accent light — a colored point light for page scenes to place manually. */
export function AccentLight({
  intensity = 1.2,
  color = "#5eead4",
  position = [0, 1, 2],
  distance = 12,
  decay = 2,
}: LightProps<"pointLight">) {
  return (
    <pointLight
      intensity={intensity}
      color={color}
      position={position}
      distance={distance}
      decay={decay}
    />
  );
}

/** Soft ambient pass for low ambient tone (cinematic fill). */
export function AmbientPass({
  intensity = 0.08,
  color = "#1a1f2e",
}: LightProps<"ambientLight">) {
  return <ambientLight intensity={intensity} color={color} />;
}