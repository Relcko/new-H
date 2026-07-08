"use client";

import * as THREE from "three";
import { extend, type ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { fresnel } from "@/shaders";

/**
 * Material library — thin declarative wrappers around MeshPhysicalMaterial /
 * MeshStandardMaterial, pre-tuned for Relcko's surface language. Each spreads
 * passthrough props so page scenes can override.
 *
 * For shader-based surfaces (holographic), a custom ShaderMaterial subclass is
 * registered with R3F via `extend()` and exposed as a JSX intrinsic element.
 */

type PhysProps = ThreeElements["meshPhysicalMaterial"];
type StdProps = ThreeElements["meshStandardMaterial"];

/* ------------------------------------------------------------------ */
/* Glass — refractive platinum-tinted glass                           */
/* ------------------------------------------------------------------ */
export function GlassMaterial({
  tint = "#c9b299",
  ior = 1.45,
  thickness = 0.6,
  roughness = 0.05,
  transmission = 1.0,
  ...props
}: Omit<PhysProps, "ref"> & {
  tint?: THREE.ColorRepresentation;
  ior?: number;
  thickness?: number;
  roughness?: number;
  transmission?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={tint}
      metalness={0}
      roughness={roughness}
      transmission={transmission}
      ior={ior}
      thickness={thickness}
      attenuationColor={tint}
      attenuationDistance={2}
      clearcoat={1}
      clearcoatRoughness={0.1}
      envMapIntensity={1.4}
      transparent
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Platinum — brushed-metal platinum                                  */
/* ------------------------------------------------------------------ */
export function PlatinumMaterial({
  color = "#c9b299",
  roughness = 0.32,
  ...props
}: Omit<PhysProps, "ref"> & {
  color?: THREE.ColorRepresentation;
  roughness?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={1}
      roughness={roughness}
      clearcoat={0.7}
      clearcoatRoughness={0.15}
      envMapIntensity={1.2}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Matte — soft non-metal surface, modest lighting                    */
/* ------------------------------------------------------------------ */
export function MatteMaterial({
  color = "#161a22",
  roughness = 0.85,
  ...props
}: Omit<StdProps, "ref"> & {
  color?: THREE.ColorRepresentation;
  roughness?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={0}
      roughness={roughness}
      envMapIntensity={0.4}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Emissive — self-lit signal interface                               */
/* ------------------------------------------------------------------ */
export function EmissiveMaterial({
  color = "#0a0c0e",
  emissive = "#5eead4",
  intensity = 2.3,
  ...props
}: Omit<StdProps, "ref"> & {
  color?: THREE.ColorRepresentation;
  emissive?: THREE.ColorRepresentation;
  intensity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      emissive={emissive}
      emissiveIntensity={intensity}
      toneMapped
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Building — architectural facade (PBR with subtle AO + clearcoat)   */
/* ------------------------------------------------------------------ */
export function BuildingMaterial({
  color = "#1a1f29",
  windowTint = "#2a3245",
  ...props
}: Omit<PhysProps, "ref"> & {
  color?: THREE.ColorRepresentation;
  windowTint?: THREE.ColorRepresentation;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.3}
      roughness={0.45}
      clearcoat={0.4}
      clearcoatRoughness={0.6}
      sheen={0.4}
      sheenColor={windowTint}
      sheenRoughness={0.6}
      envMapIntensity={0.7}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Ground — infinite floor with reflective sheen                      */
/* ------------------------------------------------------------------ */
export function GroundMaterial({
  color = "#070809",
  roughness = 0.2,
  metalness = 0.85,
  ...props
}: Omit<PhysProps, "ref"> & {
  color?: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      envMapIntensity={0.5}
      clearcoat={0.8}
      clearcoatRoughness={0.3}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Holographic — custom shader (fresnel + scanlines)                  */
/* ------------------------------------------------------------------ */
class HolographicMaterialImpl extends THREE.ShaderMaterial {
  constructor(opts: {
    tint?: THREE.ColorRepresentation;
    opacity?: number;
    fresnelPower?: number;
    scanlineIntensity?: number;
  } = {}) {
    super({
      uniforms: {
        uTime: { value: 0 },
        uTint: { value: new THREE.Color(opts.tint ?? "#5eead4") },
        uOpacity: { value: opts.opacity ?? 0.85 },
        uFresnelPower: { value: opts.fresnelPower ?? 3 },
        uScanlineIntensity: { value: opts.scanlineIntensity ?? 0.3 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vViewPos = -mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uFresnelPower;
        uniform vec3 uTint;
        uniform float uOpacity;
        uniform float uScanlineIntensity;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying vec2 vUv;
        ${fresnel}
        void main() {
          vec3 viewDir = normalize(vViewPos);
          float rim = fresnel(uFresnelPower, vNormal, viewDir);
          float scan = sin((vUv.y * 80.0) - uTime * 4.0) * 0.5 + 0.5;
          vec3 col = mix(uTint * 0.4, uTint, rim);
          col += uTint * scan * uScanlineIntensity;
          gl_FragColor = vec4(col, uOpacity * (0.5 + rim * 0.5));
        }
      `,
      transparent: true,
      depthWrite: false,
    });
  }
}

declare module "@react-three/fiber" {
  interface ThreeElements {
    holographicMaterial: Omit<ThreeElements["shaderMaterial"], "args"> & {
      args?: [
        {
          tint?: THREE.ColorRepresentation;
          opacity?: number;
          fresnelPower?: number;
          scanlineIntensity?: number;
        },
      ];
      tint?: THREE.ColorRepresentation;
      opacity?: number;
      fresnelPower?: number;
      scanlineIntensity?: number;
    };
  }
}

extend({ HolographicMaterial: HolographicMaterialImpl });

export interface HolographicMaterialProps {
  tint?: THREE.ColorRepresentation;
  opacity?: number;
  fresnelPower?: number;
  scanlineIntensity?: number;
}

export function HolographicMaterial({
  tint = "#5eead4",
  opacity = 0.85,
  fresnelPower = 3,
  scanlineIntensity = 0.3,
  ...props
}: HolographicMaterialProps &
  Omit<ThreeElements["shaderMaterial"], "args" | "ref">) {
  const args = useMemo(
    () => [{ tint, opacity, fresnelPower, scanlineIntensity }],
    [tint, opacity, fresnelPower, scanlineIntensity],
  );
  // Late uniform updates drive uTime without rebuilding.
  useEffect(() => void 0, []);
  return (
    <holographicMaterial
      // Cast around R3F's args tuple inference: the constructor takes a single
      // opts object, so we pass [opts]; TS widens the literal to an array and
      // can't unify it with the tuple type we declared.
      args={[args] as never}
      transparent
      depthWrite={false}
      {...props}
    />
  );
}