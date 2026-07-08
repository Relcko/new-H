"use client";

import { useDevStore } from "@/stores/dev-store";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useScrollStore } from "@/stores/scroll-store";
import { DevPanel } from "./dev-panel";

/**
 * CameraInspector — shows live camera transform (position, rotation, target,
 * FOV, mode, scroll progress) with a "Copy Camera State" button that copies
 * a JS object snapshot to the clipboard for debugging.
 */
export function CameraInspector() {
  const open = useDevStore((s) => s.panels.camera);
  const cameraTransform = useDevStore((s) => s.cameraTransform);
  const cameraState = useThreeSceneStore((s) => s.camera);
  const scrollProgress = useScrollStore((s) => s.progress);

  function copyState() {
    if (!cameraTransform) return;
    const snapshot = {
      position: cameraTransform.position,
      rotation: cameraTransform.rotation,
      fov: cameraTransform.fov,
      mode: cameraState.mode,
      progress: cameraState.progress,
      parallax: cameraState.parallax,
      scrollProgress,
    };
    navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
  }

  return (
    <DevPanel
      open={open}
      title="Camera Inspector"
      shortcut="F3"
      items={[
        {
          label: "Position",
          value: cameraTransform
            ? cameraTransform.position.map((v) => v.toFixed(3)).join(", ")
            : "—",
        },
        {
          label: "Rotation",
          value: cameraTransform
            ? cameraTransform.rotation.map((v) => v.toFixed(3)).join(", ")
            : "—",
        },
        { label: "FOV", value: cameraTransform ? `${cameraTransform.fov}°` : "—" },
        { label: "Mode", value: cameraState.mode },
        {
          label: "Parallax",
          value: cameraState.parallax.map((v) => v.toFixed(3)).join(", "),
        },
        {
          label: "Camera Progress",
          value: cameraState.progress.toFixed(4),
        },
        {
          label: "Scroll Progress",
          value: scrollProgress.toFixed(4),
        },
      ]}
    >
      <button
        onClick={copyState}
        disabled={!cameraTransform}
        className="mt-2 w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-platinum-bright transition-colors hover:bg-white/10 disabled:opacity-30"
      >
        Copy Camera State
      </button>
    </DevPanel>
  );
}
