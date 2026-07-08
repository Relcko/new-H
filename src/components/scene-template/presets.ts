/**
 * Named presets for the SceneTemplate. Consumers can pass a preset *name*
 * instead of a full config object; the template resolves it here.
 *
 * Presets are pure data (no gsap/three imports) so they stay in the shared
 * config graph and are trivially tree-shakeable.
 */

import type {
  LightingPresetName,
  TransitionPresetName,
  CameraPresetName,
  SceneLightConfig,
  SceneCameraConfig,
  SceneTransitionScrollConfig,
} from "./types";

/* -------------------------------------------------------------------------- */
/* Lighting presets — map to the four-point cinematic rig in @/components/lights */
/* -------------------------------------------------------------------------- */

export const LIGHTING_PRESETS: Record<LightingPresetName, SceneLightConfig> = {
  cinematic: {
    key: { intensity: 1.8, color: "#fff4e0", position: [5, 12, 6] },
    fill: { intensity: 0.3 },
    rim: { intensity: 1.2, color: "#7fb2ff", position: [-8, 6, -8] },
    accent: { intensity: 0.8, color: "#5eead4", position: [0, 2, 4] },
    ambient: { intensity: 0.08, color: "#1a1f2e" },
  },
  dawn: {
    key: { intensity: 1.4, color: "#ffd9a0", position: [3, 6, 8] },
    fill: { intensity: 0.45, color: "#3a4a6b" },
    rim: { intensity: 0.9, color: "#ffb27a", position: [-6, 3, -6] },
    ambient: { intensity: 0.12, color: "#2a2a3a" },
  },
  studio: {
    key: { intensity: 2.2, color: "#ffffff", position: [4, 8, 6] },
    fill: { intensity: 0.6, color: "#dfe6f0" },
    rim: { intensity: 1.0, color: "#ffffff", position: [-6, 5, -5] },
    ambient: { intensity: 0.2, color: "#404550" },
  },
  dramatic: {
    key: { intensity: 3.0, color: "#fff0d0", position: [6, 10, 4] },
    fill: { intensity: 0.12 },
    rim: { intensity: 2.0, color: "#5eead4", position: [-7, 4, -7] },
    accent: { intensity: 1.4, color: "#ff8a5c", position: [0, 1, 3] },
  },
  minimal: {
    key: { intensity: 1.0, color: "#ffffff", position: [4, 8, 5] },
    fill: { intensity: 0.4 },
    ambient: { intensity: 0.15 },
  },
  none: {},
};

/* -------------------------------------------------------------------------- */
/* Transition presets — gsap from/to vars + optional scroll anchors            */
/* -------------------------------------------------------------------------- */

export interface TransitionAnimation {
  from: Record<string, number>;
  to: Record<string, number>;
  /** Default scroll anchors for this preset (overridable via config). */
  scroll?: SceneTransitionScrollConfig;
}

export const TRANSITION_PRESETS: Record<
  Exclude<TransitionPresetName, "none">,
  TransitionAnimation
> = {
  fade: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  rise: {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0 },
  },
  parallax: {
    from: { y: 80 },
    to: { y: -80 },
    scroll: { start: "top bottom", end: "bottom top" },
  },
  scale: {
    from: { opacity: 0, scale: 1.06 },
    to: { opacity: 1, scale: 1 },
  },
  dolly: {
    from: { opacity: 0, scale: 1.12 },
    to: { opacity: 1, scale: 1 },
  },
};

/* -------------------------------------------------------------------------- */
/* Camera presets — rig + parallax + sync starting points                      */
/* -------------------------------------------------------------------------- */

export const CAMERA_PRESETS: Record<CameraPresetName, SceneCameraConfig> = {
  static: {
    rig: { position: [0, 0, 20], target: [0, 0, 0], fov: 32 },
    parallax: { amount: 0 },
    sync: false,
  },
  dolly: {
    rig: { position: [0, 4, 20], target: [0, 6, 0], fov: 32 },
    parallax: { amount: 0.4, lambda: 2.5 },
    sync: { scrollWeight: 0.6, introDuration: 2.4, parallaxLambda: 2.5 },
  },
  parallax: {
    rig: { position: [0, 4, 18], target: [0, 5, 0], fov: 34 },
    parallax: { amount: 0.9, lambda: 2 },
    sync: { scrollWeight: 0.4, introDuration: 1.8, parallaxLambda: 3 },
  },
};
