"use client";

import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  ChromaticAberration,
  DepthOfField,
  N8AO,
  ToneMapping,
} from "@react-three/postprocessing";
import {
  BlendFunction,
  KernelSize,
  ToneMappingMode,
} from "postprocessing";
import { useMemo, type ReactElement } from "react";
import * as THREE from "three";
import { useThreeSceneStore } from "@/lib/three/scene-store";

/**
 * Cinematic post-processing stack. Effects gated by the active QualityPreset;
 * mounts inside the canvas; page scenes get a tuned grade for free.
 *
 * Effect order: bloom → DOF → AO → vignette → CA → noise → tone mapping.
 *
 * Pure infrastructure — page scenes never modify the grade.
 */
export interface PostFXProps {
  /** MSAA samples for the composer's render target. */
  multisampling?: number;
  /** Disable the entire stack on the "weak" preset. */
  disableOnWeak?: boolean;
}

export function PostFX({
  multisampling = 0,
  disableOnWeak = true,
}: PostFXProps) {
  const preset = useThreeSceneStore((s) => s.preset);
  const quality = useThreeSceneStore((s) => s.quality);

  // CA offset shape — Vector2, memoized so the effect instance stays stable.
  const caOffset = useMemo(
    () =>
      new THREE.Vector2(
        preset.chromaticAberration.offset,
        preset.chromaticAberration.offset * 0.5,
      ),
    [preset.chromaticAberration.offset],
  );

  const disabled = disableOnWeak && quality === "weak";
  if (disabled) return null;

  const effects: ReactElement[] = [];
  if (preset.bloom.enabled) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={preset.bloom.intensity}
        luminanceThreshold={preset.bloom.luminanceThreshold}
        luminanceSmoothing={0.4}
        mipmapBlur={preset.bloom.mipmapBlur}
        kernelSize={KernelSize.LARGE}
      />,
    );
  }
  if (preset.dof.enabled) {
    effects.push(
      <DepthOfField
        key="dof"
        focusDistance={preset.dof.focusDistance}
        focalLength={preset.dof.focalLength}
        bokehScale={2.5}
      />,
    );
  }
  if (preset.ao.enabled) {
    effects.push(<N8AO key="ao" halfRes={preset.ao.halfRes} />);
  }
  if (preset.vignette.enabled) {
    effects.push(
      <Vignette
        key="vignette"
        offset={0.32}
        darkness={preset.vignette.darkness}
        blendFunction={BlendFunction.NORMAL}
        eskil={false}
      />,
    );
  }
  if (preset.chromaticAberration.enabled) {
    effects.push(
      <ChromaticAberration
        key="ca"
        offset={caOffset}
        radialModulation={false}
        modulationOffset={0}
      />,
    );
  }
  if (preset.noise.enabled) {
    effects.push(
      <Noise
        key="noise"
        premultiply
        blendFunction={BlendFunction.SCREEN}
        opacity={preset.noise.opacity}
      />,
    );
  }
  effects.push(<ToneMapping key="tonemap" mode={ToneMappingMode.ACES_FILMIC} />);

  return (
    <EffectComposer
      multisampling={preset.antialias ? multisampling : 0}
      enableNormalPass={preset.ao.enabled}
      autoClear
    >
      {effects}
    </EffectComposer>
  );
}