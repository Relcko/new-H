"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useScrollStore } from "@/stores/scroll-store";
import { damp } from "@/lib/utils";
import { CameraRig } from "@/components/camera/camera-rig";
import {
  CameraController,
  type CameraBehavior,
} from "@/components/camera/camera-controller";
import { CameraParallax } from "@/components/camera/camera-parallax";
import { KeyLight, FillLight, RimLight, AccentLight } from "@/components/lights";
import { ParticleField } from "@/components/particles/particle-field";
import { GroundMaterial } from "@/components/materials";
import { HeroEnvironment } from "@/components/assets/hero-environment";
import { HeroModel } from "@/components/assets/hero-model";
import { HeroBuildings } from "./hero-buildings";

/**
 * HeroCameraSync — bridges the page scroll store + R3F pointer into the
 * engine's camera state (progress + parallax + mode). Runs inside the canvas.
 *
 * A short "arrival" intro ramps progress 0 → 0.4 over ~2.4 s so the camera
 * dollies forward on mount; the remaining 0.6 of the dolly is scroll-driven.
 * Writes are throttled by an epsilon so idle frames don't churn subscribers.
 */
function HeroCameraSync() {
  const setCamera = useThreeSceneStore((s) => s.setCamera);
  const intro = useRef(0);
  const par = useRef<[number, number]>([0, 0]);
  const last = useRef({ p: -1, px: -1, py: -1 });

  useEffect(() => {
    setCamera({ mode: "hero" });
  }, [setCamera]);

  useFrame((state, delta) => {
    intro.current = Math.min(1, intro.current + delta / 2.4);
    const scrollP = useScrollStore.getState().progress;
    const p = intro.current * 0.4 + scrollP * 0.6;

    par.current[0] = damp(par.current[0], state.pointer.x, 2.5, delta);
    par.current[1] = damp(par.current[1], state.pointer.y, 2.5, delta);

    const lp = last.current;
    if (
      Math.abs(p - lp.p) > 0.0005 ||
      Math.abs(par.current[0] - lp.px) > 0.0005 ||
      Math.abs(par.current[1] - lp.py) > 0.0005
    ) {
      lp.p = p;
      lp.px = par.current[0];
      lp.py = par.current[1];
      setCamera({
        progress: p,
        parallax: [par.current[0], par.current[1]],
        mode: "hero",
      });
    }
  });

  return null;
}

/**
 * HeroScene — the full 3D composition for ACT I. Consumes engine modules and
 * the asset placeholder hooks only; no engine edits.
 *
 * Camera dolly + idle drift via CameraController, mouse parallax via
 * CameraParallax, HDR environment via HeroEnvironment (falls back to night
 * preset when no production HDR exists), premium four-point lighting,
 * reflective ground, procedural instanced city (HeroBuildings), optional GLB
 * model via HeroModel (falls back to a placeholder monolith), and a gold-dust
 * particle field.
 */
export function HeroScene() {
  const behaviors = useMemo<Record<string, CameraBehavior>>(
    () => ({
      hero: {
        position: (p) => {
          const t = performance.now() * 0.001;
          const idleX = Math.sin(t * 0.15) * 0.4;
          const idleY = Math.cos(t * 0.12) * 0.25;
          return [idleX, 4 + p * 2 + idleY, 20 - p * 6];
        },
        target: (p) => [0, 6 + p * 1.5, 0],
      },
      default: {
        position: () => [0, 4, 20],
        target: () => [0, 6, 0],
      },
    }),
    [],
  );

  return (
    <>
      <CameraRig position={[0, 4, 20]} target={[0, 6, 0]} fov={32} />
      <HeroCameraSync />
      <CameraController behaviors={behaviors} lambda={2.5} />
      <CameraParallax amount={0.6} lambda={2.5} />

      {/* HDR environment — loads from /assets/hdr/ if present, else "night" preset. */}
      <HeroEnvironment
        fallbackPreset="night"
        fog={{ color: "#050608", near: 14, far: 52 }}
      />

      <KeyLight intensity={1.8} position={[5, 12, 6]} />
      <FillLight intensity={0.3} />
      <RimLight intensity={1.2} position={[-8, 6, -8]} />
      <AccentLight intensity={0.8} color="#5eead4" position={[0, 2, 4]} />

      {/* Reflective ground. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[220, 220]} />
        <GroundMaterial />
      </mesh>

      {/* Procedural instanced city. */}
      <HeroBuildings />

      {/* Optional GLB model — loads from /assets/models/ if present,
          else falls back to a placeholder monolith. */}
      <HeroModel position={[0, 0, 0]} scale={1} />

      {/* Gold-dust particle field. */}
      <ParticleField
        count={2000}
        bounds={16}
        color="#c9b299"
        size={0.014}
        opacity={0.7}
      />
    </>
  );
}
