"use client";
/* eslint-disable react-hooks/immutability -- the GL renderer and scene object
   are intentional mutation targets; this manager syncs them per preset. */

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useThreeSceneStore } from "@/lib/three/scene-store";

/**
 * RendererManager — runs inside the canvas (no DOM output). Wires the
 * WebGLRenderer configuration that must be applied at runtime rather than via
 * `<Canvas gl=>` props (e.g. quality-dependent shadow map size, exposure) and
 * keeps them in sync with the active QualityPreset.
 *
 * Pure infrastructure — no scene content, no lights, no geometry.
 */
export function RendererManager() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const preset = useThreeSceneStore((s) => s.preset);

  useLayoutEffect(() => {
    gl.toneMappingExposure = preset.exposure;

    if (preset.shadowMapSize > 0) {
      gl.shadowMap.enabled = true;
      gl.shadowMap.type = THREE.PCFShadowMap;
    } else {
      gl.shadowMap.enabled = false;
    }

    gl.outputColorSpace = THREE.SRGBColorSpace;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    scene.matrixWorldAutoUpdate = true;
  }, [gl, scene, preset]);

  return null;
}