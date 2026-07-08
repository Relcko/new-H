"use client";

import { useDevStore } from "@/stores/dev-store";
import { useScrollStore } from "@/stores/scroll-store";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useSceneStore } from "@/stores/scene-store";
import { DevPanel } from "./dev-panel";

/**
 * DebugPanel — shows runtime engine metrics: FPS, frame time, DPR, quality
 * tier, active scene, scroll progress, camera state, particle count, shadow
 * resolution, bloom/postFX status, and memory usage (if available).
 */
export function DebugPanel() {
  const open = useDevStore((s) => s.panels.debug);
  const fps = useDevStore((s) => s.fps);
  const frameTime = useDevStore((s) => s.frameTime);
  const cameraTransform = useDevStore((s) => s.cameraTransform);

  const scrollProgress = useScrollStore((s) => s.progress);
  const scrollTop = useScrollStore((s) => s.scrollTop);
  const velocity = useScrollStore((s) => s.velocity);
  const viewport = useScrollStore((s) => s.viewport);

  const quality = useThreeSceneStore((s) => s.quality);
  const preset = useThreeSceneStore((s) => s.preset);
  const activeScene = useThreeSceneStore((s) => s.activeSceneId);
  const cameraState = useThreeSceneStore((s) => s.camera);

  const reduced = useSceneStore((s) => s.reducedMotion);
  const paused = useSceneStore((s) => s.paused);

  const mem =
    typeof performance !== "undefined" &&
    (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
  const memMB = mem ? (mem.usedJSHeapSize / 1048576).toFixed(1) : "—";

  return (
    <DevPanel
      open={open}
      title="Debug"
      shortcut="F1"
      items={[
        { label: "FPS", value: `${fps}` },
        { label: "Frame Time", value: `${frameTime}ms` },
        { label: "DPR", value: `${viewport.dpr.toFixed(2)}` },
        { label: "Quality Tier", value: quality.toUpperCase() },
        { label: "GPU Tier", value: preset.tier.toUpperCase() },
        { label: "Active Scene", value: activeScene ?? "—" },
        { label: "Scroll Progress", value: `${(scrollProgress * 100).toFixed(1)}%` },
        { label: "Scroll Top", value: `${Math.round(scrollTop)}px` },
        { label: "Scroll Velocity", value: `${velocity.toFixed(1)}px/s` },
        {
          label: "Camera Position",
          value: cameraTransform
            ? `${cameraTransform.position.map((v) => v.toFixed(2)).join(", ")}`
            : "—",
        },
        {
          label: "Camera Rotation",
          value: cameraTransform
            ? `${cameraTransform.rotation.map((v) => v.toFixed(2)).join(", ")}`
            : "—",
        },
        { label: "Camera FOV", value: cameraTransform ? `${cameraTransform.fov}°` : "—" },
        { label: "Camera Mode", value: cameraState.mode },
        {
          label: "Particle Scale",
          value: `${(preset.particleScale * 100).toFixed(0)}%`,
        },
        {
          label: "Shadow Resolution",
          value: preset.shadowMapSize > 0 ? `${preset.shadowMapSize}px` : "off",
        },
        { label: "Bloom", value: preset.bloom.enabled ? "on" : "off" },
        { label: "PostFX", value: quality !== "weak" ? "on" : "off" },
        { label: "Viewport", value: `${viewport.width}×${viewport.height}` },
        { label: "Memory (JS Heap)", value: `${memMB} MB` },
        { label: "Reduced Motion", value: reduced ? "yes" : "no" },
        { label: "Paused", value: paused ? "yes" : "no" },
      ]}
    />
  );
}
