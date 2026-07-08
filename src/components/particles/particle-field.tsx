"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useSceneStore } from "@/stores/scene-store";

/**
 * Reusable GPU-friendly particle field. Positions are spawned into a single
 * Float32 buffer attribute once on mount; motion is a shader-driven drift
 * so per-frame CPU cost is one uniform write. Density scales with the active
 * quality preset.
 *
 * Pure infrastructure — page scenes pass color, count, bounds.
 *
 * The `Math.random()` calls run during the first commit (the React Compiler
 * purity rule flags this; we accept it here because the field is intentionally
 * seeded once per mount and made GPU-stable thereafter).
 */
/* eslint-disable react-hooks/purity -- particle field is seeded once per mount
   by design; geometry is regenerated only when N or bounds change. */
export interface ParticleFieldProps {
  count?: number;
  bounds?: number;
  color?: THREE.ColorRepresentation;
  size?: number;
  speed?: number;
  opacity?: number;
  activeSceneId?: string;
}

export function ParticleField({
  count = 2500,
  bounds = 12,
  color = "#c9b299",
  size = 0.012,
  speed = 0.04,
  opacity = 0.85,
  activeSceneId,
}: ParticleFieldProps) {
  const preset = useThreeSceneStore((s) => s.preset);
  const activeId = useThreeSceneStore((s) => s.activeSceneId);
  const reduced = useSceneStore((s) => s.reducedMotion);

  const N = Math.max(32, Math.floor(count * preset.particleScale));
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 0] = (Math.random() * 2 - 1) * bounds;
      arr[i * 3 + 1] = (Math.random() * 2 - 1) * bounds * 0.6;
      arr[i * 3 + 2] = (Math.random() * 2 - 1) * bounds;
    }
    return arr;
  }, [N, bounds]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
      uOpacity: { value: opacity },
    }),
    [color, size, opacity],
  );

  const drift = reduced ? 0 : 1;

  useFrame((_, delta) => {
    if (activeSceneId && activeId !== activeSceneId) return;
    const m = matRef.current;
    if (m) m.uniforms.uTime.value += delta * speed;
  });

  return (
    <points frustumCulled>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={/* glsl */ `
          uniform float uTime;
          uniform float uSize;
          varying float vDepth;
          void main() {
            vec3 p = position;
            p.y += sin(uTime * ${drift}.0 + p.x * 0.4) * 0.3;
            p.x += cos(uTime * ${drift}.0 * 0.7 + p.z * 0.3) * 0.18;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * 300.0 / vDepth;
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uColor;
          uniform float uOpacity;
          void main() {
            float d = clamp(length(gl_PointCoord - 0.5), 0.0, 1.0);
            float alpha = smoothstep(0.5, 0.0, d) * uOpacity;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </points>
  );
}
/* eslint-enable react-hooks/purity */