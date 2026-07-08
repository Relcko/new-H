"use client";

import dynamic from "next/dynamic";
import { useSceneStore } from "@/stores/scene-store";
import { CanvasRoot, Scene3D } from "@/components/canvas";
import { PostFX } from "@/components/postprocessing/post-fx";
import { HeroScene } from "./hero-scene";

/**
 * DevCameraBridge — dynamically imported only in development. Lives inside
 * the R3F canvas and writes the camera's transform to the dev store. In
 * production, resolves to `() => null` and the module is never bundled.
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

/**
 * HeroCanvas — the fixed cinematic background layer for the Hero. Mounts the
 * engine's single `<CanvasRoot>` with the hero scene + post stack.
 *
 * Reduced-motion: returns null so the canvas never boots; the Hero UI's own
 * ambient gradient acts as the static premium poster.
 */
export function HeroCanvas() {
  const reduced = useSceneStore((s) => s.reducedMotion);
  if (reduced) return null;

  return (
    <div className="fixed inset-0 z-0" aria-hidden>
      <CanvasRoot>
        <Scene3D id="hero">
          <HeroScene />
          <DevCameraBridge />
        </Scene3D>
        <PostFX />
      </CanvasRoot>
    </div>
  );
}
