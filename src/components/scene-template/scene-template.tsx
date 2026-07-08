"use client";

import { useMemo } from "react";
import { useSceneStore } from "@/stores/scene-store";
import { cn } from "@/lib/cn";
import { SceneCanvasLayer } from "./scene-canvas-layer";
import { SceneOverlay } from "./scene-overlay";
import { SceneVideoPlaceholder } from "./scene-asset-placeholders";
import { LIGHTING_PRESETS } from "./presets";
import { useScenePerformance, useSceneEngineEvents } from "./hooks";
import type { SceneTemplateProps } from "./types";

/**
 * SceneTemplate — the reusable architecture every future scene composes. It
 * wires the engine's existing primitives (CanvasRoot/Scene3D, camera rig +
 * controller + parallax + sync, lights, environment, asset placeholders, post
 * stack, GSAP scene registry) from a single declarative config, and applies the
 * cross-cutting concerns every scene shares:
 *
 *   • Reduced motion — canvas hidden (or poster); the UI stands alone.
 *   • Responsive — canvas skippable on mobile/weak tiers.
 *   • Performance hooks — quality/ready changes surfaced to the scene.
 *   • Analytics hooks — mount/enter/exit/active/inactive/progress/event.
 *   • Accessibility — labelled landmark + optional live region + decorative
 *     canvas (aria-hidden).
 *
 * No visual content is created here — `children` (3D) and `overlay` (UI) are
 * supplied by the consuming scene. Layering mirrors the hero: z-0 canvas,
 * z-[1] optional video, z-10 overlay.
 */
export function SceneTemplate({
  id,
  children,
  overlay,
  canvas,
  camera,
  lighting,
  environment,
  assets,
  transition,
  performance,
  analytics,
  accessibility,
  responsive,
  overlayClassName,
  canvasClassName,
  className,
}: SceneTemplateProps) {
  const reduced = useSceneStore((s) => s.reducedMotion);
  const canvasTier = useSceneStore((s) => s.canvasTier);

  // Resolve a lighting preset name → per-light config.
  const lightingConfig = useMemo(() => {
    if (!lighting) return undefined;
    if (typeof lighting === "string") return LIGHTING_PRESETS[lighting];
    return lighting;
  }, [lighting]);

  // Cross-cutting hooks (performance + global engine events).
  useScenePerformance(performance);
  useSceneEngineEvents(analytics?.onEvent);

  // Decide whether the 3D canvas layer should mount.
  const canvasCfg = canvas === false ? null : canvas;
  let canvasEnabled =
    canvasCfg !== null && (canvasCfg !== undefined || children != null);
  if (
    canvasEnabled &&
    reduced &&
    (canvasCfg?.reducedMotionStrategy ?? "hide") === "hide"
  ) {
    canvasEnabled = false;
  }
  if (
    canvasEnabled &&
    responsive?.disableCanvasOnMobile &&
    canvasTier === "mobile"
  ) {
    canvasEnabled = false;
  }
  if (
    canvasEnabled &&
    responsive?.disableCanvasOnWeak &&
    canvasTier === "weak"
  ) {
    canvasEnabled = false;
  }

  const showReducedPoster =
    !canvasEnabled &&
    reduced &&
    canvasCfg?.reducedMotionStrategy === "poster" &&
    canvasCfg.poster != null;

  return (
    <>
      {canvasEnabled && (
        <SceneCanvasLayer
          id={id}
          camera={camera}
          lighting={lightingConfig}
          environment={environment}
          assets={assets}
          canvas={canvasCfg ?? {}}
          onActive={analytics?.onActive}
          onInactive={analytics?.onInactive}
          className={canvasClassName}
          decorative={accessibility?.decorativeCanvas ?? true}
        >
          {children}
        </SceneCanvasLayer>
      )}

      {showReducedPoster && (
        <div className={cn("absolute inset-0 z-0", canvasClassName)} aria-hidden>
          {canvasCfg?.poster}
        </div>
      )}

      {assets?.video && (
        <SceneVideoPlaceholder
          sceneId={id}
          manifestKey={assets.video.manifestKey}
          poster={assets.video.poster}
          fallback={assets.video.fallback}
          autoPlay={assets.video.autoPlay}
          className={cn("z-[1]", assets.video.className)}
        />
      )}

      <SceneOverlay
        id={id}
        overlay={overlay}
        transition={transition}
        accessibility={accessibility}
        responsive={responsive}
        onEnter={analytics?.onEnter}
        onExit={analytics?.onExit}
        onProgress={analytics?.onProgress}
        onMount={analytics?.onMount}
        onUnmount={analytics?.onUnmount}
        className={className}
        overlayClassName={overlayClassName}
      />
    </>
  );
}
