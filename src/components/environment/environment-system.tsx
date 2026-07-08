"use client";

import { Suspense, type ReactNode } from "react";
import { Environment, Sky } from "@react-three/drei";
import { useThreeSceneStore } from "@/lib/three/scene-store";

/**
 * EnvironmentSystem — provides HDR-based image lighting to all PBR materials
 * in the scene, plus optional skybox background and fog. Reads the active
 * quality preset for env-map resolution.
 *
 * Pure infrastructure: pages pass this as a `<Scene3D>` child if they want
 * an environment; nothing page-specific lives here.
 */
export interface EnvironmentSystemProps {
  preset?: "city" | "studio" | "sunset" | "night" | "warehouse" | "dawn";
  /** Optional custom HDR path under /public (PMREM-friendly). */
  files?: string;
  background?: boolean;
  /** Skybox on (drei <Sky>) for outdoor renders. */
  sky?: boolean;
  fog?: { color: string; near: number; far: number };
  children?: ReactNode;
}

export function EnvironmentSystem({
  preset = "night",
  files,
  background = false,
  sky = false,
  fog,
  children,
}: EnvironmentSystemProps) {
  const envResolution = useThreeSceneStore((s) => s.preset.envResolution);

  return (
    <>
      {fog && (
        // THREE.Fog (linear). Use <fogExp2/> for exponential instead.
        <fog attach="fog" args={[fog.color, fog.near, fog.far]} />
      )}
      {sky && <Sky sunPosition={[0, 0.2, -1]} turbidity={8} rayleigh={2} />}
      <Suspense fallback={null}>
        <Environment
          preset={preset}
          files={files}
          background={background}
          resolution={envResolution}
          frames={1}
        />
      </Suspense>
      {children}
    </>
  );
}