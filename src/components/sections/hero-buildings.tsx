"use client";
/* eslint-disable react-hooks/immutability -- ShaderMaterial uniforms are
   mutated per frame by design (R3F canonical pattern for shader time). */

import * as THREE from "three";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useSceneStore } from "@/stores/scene-store";
import { fresnel } from "@/shaders";
import type { QualityTier } from "@/lib/three/quality";

/**
 * Procedural instanced city for the Hero. No external assets — every tower is
 * a unit box scaled per-instance, shaded by a single custom ShaderMaterial
 * that draws a window grid, an emissive flicker, a fresnel rim, and a rising
 * reveal mask so the city "emerges from light" on mount.
 *
 * Per-building variation is derived from the instance position itself (no
 * custom instanced attribute needed — the seed comes from instanceMatrix[3]),
 * keeping the shader compatible with three.js's automatic instancing plumbing.
 *
 * Density scales with the active quality preset.
 */

const DENSITY: Record<QualityTier, number> = {
  ultra: 1,
  high: 0.82,
  medium: 0.6,
  low: 0.4,
  weak: 0.25,
};
const BASE_COUNT = 150;

export function HeroBuildings() {
  const preset = useThreeSceneStore((s) => s.preset);
  const reduced = useSceneStore((s) => s.reducedMotion);
  const N = Math.max(20, Math.floor(BASE_COUNT * DENSITY[preset.tier]));

  const meshRef = useRef<THREE.InstancedMesh>(null);

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        name: "HeroBuildings",
        uniforms: {
          uTime: { value: 0 },
          uReveal: { value: 0 },
          uBase: { value: new THREE.Color("#0a0d14") },
          uWindow: { value: new THREE.Color("#c9b299") },
          uRim: { value: new THREE.Color("#5eead4") },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying float vSeed;
          void main() {
            vUv = uv;
            #ifdef USE_INSTANCING
              vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
              vSeed = instanceMatrix[3].x * 0.3 + instanceMatrix[3].z * 0.7;
              vNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);
            #else
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vSeed = 0.0;
              vNormal = normalize(mat3(modelMatrix) * normal);
            #endif
            vWorldPos = worldPos.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPos;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uReveal;
          uniform vec3 uBase;
          uniform vec3 uWindow;
          uniform vec3 uRim;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying float vSeed;
          ${fresnel}
          float hash(vec2 p){return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);}
          void main(){
            float isRoof = step(0.5, abs(vNormal.y));
            float cols = 5.0;
            float rows = 18.0;
            vec2 g = vec2(vUv.x * cols, vUv.y * rows);
            vec2 cell = floor(g);
            vec2 cUv = fract(g);
            float h = hash(cell + vec2(vSeed * 17.0));
            float lit = step(0.62, h);
            float wx = smoothstep(0.08, 0.32, cUv.x) - smoothstep(0.68, 0.92, cUv.x);
            float wy = smoothstep(0.08, 0.30, cUv.y) - smoothstep(0.70, 0.92, cUv.y);
            float win = clamp(wx, 0.0, 1.0) * clamp(wy, 0.0, 1.0) * lit * (1.0 - isRoof);
            float flick = 0.8 + 0.2 * sin(uTime * 0.4 + h * 50.0);
            vec3 winCol = mix(uWindow, uRim, h * 0.4) * flick;
            vec3 col = uBase;
            col = mix(col, winCol, win * 0.85);
            vec3 viewDir = normalize(cameraPosition - vWorldPos);
            float rim = fresnel(3.5, vNormal, viewDir);
            col += uRim * rim * 0.3;
            float vis = 1.0 - smoothstep(uReveal, uReveal + 0.08, vUv.y);
            float edge = smoothstep(uReveal - 0.25, uReveal, vUv.y)
                       * (1.0 - smoothstep(uReveal, uReveal + 0.05, vUv.y));
            col += uRim * edge * 0.7;
            col = mix(col, uBase * 0.5, isRoof);
            gl_FragColor = vec4(col, vis);
          }
        `,
        transparent: true,
      }),
    [],
  );

  // The geometry + material are created outside R3F's ownership (passed via
  // instancedMesh args). R3F only invokes `.dispose()` on the mesh itself, and
  // InstancedMesh has none, so release the compiled program + attribute buffers
  // explicitly on unmount to avoid leaking GPU resources between scenes.
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    let i = 0;
    const range = 5;
    for (let x = -range; x <= range && i < N; x++) {
      for (let z = -range; z <= range && i < N; z++) {
        if (z > 2 && Math.random() < 0.7) continue;
        if (Math.random() < 0.2) continue;
        const dist = Math.hypot(x, z);
        const height = 3 + Math.random() * 9 + Math.max(0, 4 - dist) * 1.8;
        const w = 0.8 + Math.random() * 0.5;
        const d = 0.8 + Math.random() * 0.5;
        dummy.position.set(
          x * 2.4 + (Math.random() - 0.5) * 0.5,
          height / 2,
          z * 2.4 + (Math.random() - 0.5) * 0.5,
        );
        dummy.scale.set(w, height, d);
        dummy.rotation.y = (Math.random() - 0.5) * 0.2;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        i++;
      }
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.frustumCulled = false;
  }, [N]);

  useFrame((_, delta) => {
    if (reduced) {
      material.uniforms.uReveal.value = 1;
      return;
    }
    material.uniforms.uTime.value += delta;
    material.uniforms.uReveal.value = Math.min(
      1,
      material.uniforms.uReveal.value + delta / 2.4,
    );
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, BASE_COUNT]} />;
}
