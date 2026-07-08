"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";

/**
 * ShaderDiagnostic — mounts each custom ShaderMaterial inside an isolated
 * canvas, hooks into THREE's onShaderError, and writes captured errors to
 * a visible DOM element we can read via curl.
 */

function TestHeroBuildings() {
  return (
    <instancedMesh args={[undefined, undefined, 1]}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        name="HeroBuildings"
        uniforms={{
          uTime: { value: 0 },
          uReveal: { value: 0 },
          uBase: { value: new THREE.Color("#0a0d14") },
          uWindow: { value: new THREE.Color("#c9b299") },
          uRim: { value: new THREE.Color("#5eead4") },
        }}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying float vSeed;
          void main() {
            vUv = uv;
            #ifdef USE_INSTANCING
              vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
              vSeed = instanceMatrix[3].x * 0.3 + instanceMatrix[3].z * 0.7;
              vNormal = normalize(mat3(modelMatrix * instanceMatrix) * normal);
            #else
              vec4 world = modelMatrix * vec4(position, 1.0);
              vSeed = 0.0;
              vNormal = normalize(mat3(modelMatrix) * normal);
            #endif
            vWorldPos = world.xyz;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uReveal;
          uniform vec3 uBase;
          uniform vec3 uWindow;
          uniform vec3 uRim;
          varying vec2 vUv;
          varying vec3 vNormal;
          varying vec3 vWorldPos;
          varying float vSeed;
          float fresnel(float fresnelPower, vec3 worldNormal, vec3 viewDir) {
            return pow(1.0 - max(dot(normalize(worldNormal), normalize(viewDir)), 0.0), fresnelPower);
          }
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
        `}
        transparent
      />
    </instancedMesh>
  );
}

function TestParticleField() {
  const positions = new Float32Array(3);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        name="ParticleField"
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("#c9b299") },
          uSize: { value: 0.012 },
          uOpacity: { value: 0.85 },
        }}
        transparent
        depthWrite={false}
        vertexShader={`
          uniform float uTime;
          uniform float uSize;
          varying float vDepth;
          void main() {
            vec3 p = position;
            p.y += sin(uTime * 1.0 + p.x * 0.4) * 0.3;
            p.x += cos(uTime * 1.0 * 0.7 + p.z * 0.3) * 0.18;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * 300.0 / vDepth;
          }
        `}
        fragmentShader={`
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

export function ShaderDiagnostic() {
  const [errors, setErrors] = useState<string>("");

  useEffect(() => {
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = args.map((a) => (typeof a === "string" ? a : String(a))).join(" ");
      setErrors((prev) => prev + "\n---\n" + msg);
      origError(...(args as [unknown, ...unknown[]]));
    };
    return () => {
      console.error = origError;
    };
  }, []);

  return (
    <div>
      <div
        id="shader-errors"
        style={{ color: "red", fontSize: 12, padding: 20, minHeight: 50, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
      >
        {errors || "Waiting for shader compilation..."}
      </div>
      <div style={{ position: "fixed", top: 0, left: 0, width: 1, height: 1, opacity: 0.01 }}>
        <Canvas
          gl={{ antialias: false, alpha: true }}
          onCreated={({ gl }) => {
            gl.debug.checkShaderErrors = true;
            gl.debug.onShaderError = (glCtx, program, vertexShader, fragmentShader) => {
              const vLog = glCtx.getShaderInfoLog(vertexShader) || "";
              const fLog = glCtx.getShaderInfoLog(fragmentShader) || "";
              const pLog = glCtx.getProgramInfoLog(program) || "";
              const vSrc = glCtx.getShaderSource(vertexShader) || "";
              setErrors((prev) =>
                prev +
                "\n=== SHADER ERROR ===\n" +
                "VERTEX LOG: " + vLog + "\n" +
                "FRAGMENT LOG: " + fLog + "\n" +
                "PROGRAM LOG: " + pLog + "\n" +
                "VERTEX SOURCE (first 2000 chars):\n" + vSrc.substring(0, 2000) + "\n",
              );
            };
          }}
        >
          <TestHeroBuildings />
          <TestParticleField />
        </Canvas>
      </div>
    </div>
  );
}
