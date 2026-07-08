"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { CanvasRoot, Scene3D } from "@/components/canvas";
import { CameraRig } from "@/components/camera/camera-rig";
import { CameraController } from "@/components/camera/camera-controller";
import { CameraParallax } from "@/components/camera/camera-parallax";
import { ParticleField } from "@/components/particles/particle-field";
import { PostFX } from "@/components/postprocessing/post-fx";
import { cn } from "@/lib/cn";
import { SceneCameraSync } from "./scene-camera-sync";
import { SceneLighting } from "./scene-lighting";
import {
  SceneModelPlaceholder,
  SceneEnvironmentPlaceholder,
} from "./scene-asset-placeholders";
import type {
  SceneCameraConfig,
  SceneCanvasConfig,
  SceneLightConfig,
  SceneEnvironmentConfig,
  SceneAssetConfig,
} from "./types";

/**
 * DevCameraBridge — dynamically imported only in development. Lives inside the
 * R3F canvas and writes the camera transform to the dev store. In production,
 * resolves to `() => null` and the module is never bundled (zero prod impact).
 */
const DevCameraBridge =
  process.env.NODE_ENV !== "production"
    ? dynamic(
        () =>
          import("@/components/dev/dev-camera-bridge").then(
            (m) => m.DevCameraBridge,
          ),
        { ssr: false, loading: () => null },
      )
    : () => null;

export interface SceneCanvasLayerProps {
  id: string;
  children?: ReactNode;
  camera?: SceneCameraConfig;
  lighting?: SceneLightConfig;
  environment?: SceneEnvironmentConfig;
  assets?: SceneAssetConfig;
  canvas: SceneCanvasConfig;
  onActive?: () => void;
  onInactive?: () => void;
  className?: string;
  decorative?: boolean;
}

/**
 * SceneCanvasLayer — the 3D backdrop for a scene. Mounts the engine's single
 * `<CanvasRoot>` with a `<Scene3D id>` that declares camera ownership, then
 * composes the camera rig/sync/controller/parallax, the resolved lighting, the
 * environment placeholder, the model + particle placeholders, the scene's own
 * 3D children, the dev camera bridge, and the post-processing stack.
 *
 * Pure composition — no scene content lives here; everything is wired from the
 * declarative config.
 */
export function SceneCanvasLayer({
  id,
  children,
  camera,
  lighting,
  environment,
  assets,
  canvas,
  onActive,
  onInactive,
  className,
  decorative = true,
}: SceneCanvasLayerProps) {
  const activeMode = camera?.activeMode ?? id;
  // `false` disables the scroll→camera bridge; otherwise it mounts by default.
  const syncCfg = camera?.sync === false ? null : camera?.sync;

  return (
    <div
      className={cn(
        canvas.fixed !== false ? "fixed inset-0 z-0" : "absolute inset-0 z-0",
        className,
      )}
      aria-hidden={decorative || undefined}
    >
      <CanvasRoot fallback={canvas.fallback}>
        <Scene3D
          id={id}
          priority={canvas.priority}
          onActive={onActive}
          onInactive={onInactive}
        >
          {camera && (
            <CameraRig
              position={camera.rig?.position}
              target={camera.rig?.target}
              fov={camera.rig?.fov}
              distance={camera.rig?.distance}
            />
          )}
          {camera && syncCfg !== null && (
            <SceneCameraSync
              sceneId={id}
              activeMode={activeMode}
              scrollWeight={syncCfg?.scrollWeight}
              introDuration={syncCfg?.introDuration}
              parallaxLambda={syncCfg?.parallaxLambda}
            />
          )}
          {camera?.behaviors && (
            <CameraController
              behaviors={camera.behaviors}
              lambda={camera.controller?.lambda}
              activeSceneId={id}
            />
          )}
          {camera?.parallax && (
            <CameraParallax
              amount={camera.parallax.amount}
              lambda={camera.parallax.lambda}
              activeSceneId={id}
            />
          )}
          {lighting && <SceneLighting config={lighting} />}
          {environment && (
            <SceneEnvironmentPlaceholder
              sceneId={id}
              preset={environment.preset}
              files={environment.files}
              manifestKey={environment.manifestKey}
              background={environment.background}
              sky={environment.sky}
              fog={environment.fog}
            />
          )}
          {assets?.model && (
            <SceneModelPlaceholder
              sceneId={id}
              manifestKey={assets.model.manifestKey}
              position={assets.model.position}
              scale={assets.model.scale}
              rotation={assets.model.rotation}
              fallback={assets.model.fallback}
            />
          )}
          {assets?.particles && (
            <ParticleField
              activeSceneId={id}
              count={assets.particles.count}
              bounds={assets.particles.bounds}
              color={assets.particles.color}
              size={assets.particles.size}
              speed={assets.particles.speed}
              opacity={assets.particles.opacity}
            />
          )}
          {children}
          <DevCameraBridge />
        </Scene3D>
        {canvas.postProcessing !== false && <PostFX />}
      </CanvasRoot>
    </div>
  );
}
