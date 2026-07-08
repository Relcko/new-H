/**
 * SceneTemplate — reusable scene architecture barrel.
 *
 * Every future scene (Problem, Solution, Marketplace, …) composes
 * `<SceneTemplate>` with its own `children` (3D) and `overlay` (UI). The
 * sub-components and presets are also exported for advanced/assembled usage.
 */

export { SceneTemplate } from "./scene-template";
export type { SceneTemplateProps } from "./types";

export { SceneCanvasLayer } from "./scene-canvas-layer";
export type { SceneCanvasLayerProps } from "./scene-canvas-layer";

export { SceneOverlay } from "./scene-overlay";
export type { SceneOverlayProps } from "./scene-overlay";

export { SceneLighting } from "./scene-lighting";
export type { SceneLightingProps } from "./scene-lighting";

export { SceneCameraSync } from "./scene-camera-sync";
export type { SceneCameraSyncProps } from "./scene-camera-sync";

export {
  SceneModelPlaceholder,
  SceneEnvironmentPlaceholder,
  SceneVideoPlaceholder,
} from "./scene-asset-placeholders";
export type {
  SceneModelPlaceholderProps,
  SceneEnvironmentPlaceholderProps,
  SceneVideoPlaceholderProps,
} from "./scene-asset-placeholders";

export {
  LIGHTING_PRESETS,
  TRANSITION_PRESETS,
  CAMERA_PRESETS,
} from "./presets";
export type { TransitionAnimation } from "./presets";

export type {
  Vec3,
  LightingPresetName,
  EnvironmentPresetName,
  TransitionPresetName,
  CameraPresetName,
  SceneLightConfig,
  SceneKeyLight,
  SceneFillLight,
  SceneRimLight,
  SceneAccentLight,
  SceneAmbientLight,
  SceneFog,
  SceneEnvironmentConfig,
  SceneModelAsset,
  SceneVideoAsset,
  SceneParticleAsset,
  SceneAssetConfig,
  SceneCameraRig,
  SceneCameraSyncConfig,
  SceneCameraConfig,
  SceneCanvasConfig,
  SceneTransitionScrollConfig,
  SceneTransitionConfig,
  ScenePerformanceHooks,
  SceneAnalyticsHooks,
  SceneAccessibilityConfig,
  SceneResponsiveConfig,
} from "./types";
