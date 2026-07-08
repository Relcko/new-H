/**
 * SceneTemplate — public type surface.
 *
 * Every config object here is a *declarative* description of one concern a
 * scene needs (camera, lighting, environment, assets, transition, performance,
 * analytics, accessibility, responsive). The template composes the existing
 * engine primitives from these descriptions; no page-specific behavior lives
 * in the template itself.
 *
 * Design rule: nothing here describes *visual content*. Slots (`children`,
 * `overlay`, `*.fallback`) are filled by the consuming scene.
 */

import type { ReactNode } from "react";
import type { CameraBehavior } from "@/components/camera/camera-controller";
import type { QualityTier } from "@/lib/three/quality";
import type { GsapContext, SceneHandle, Timeline } from "@/lib/scroll/types";
import type { AssetKind } from "@/lib/asset-manifest";

/** Tuple helper for world-space coordinates. */
export type Vec3 = [number, number, number];

/* ---- Preset name unions -------------------------------------------------- */

export type LightingPresetName =
  | "cinematic"
  | "dawn"
  | "studio"
  | "dramatic"
  | "minimal"
  | "none";

export type EnvironmentPresetName =
  | "city"
  | "studio"
  | "sunset"
  | "night"
  | "warehouse"
  | "dawn";

export type TransitionPresetName =
  | "fade"
  | "rise"
  | "parallax"
  | "scale"
  | "dolly"
  | "none";

export type CameraPresetName = "static" | "dolly" | "parallax";

/* ---- Lighting ------------------------------------------------------------ */

export interface SceneKeyLight {
  intensity?: number;
  color?: string;
  position?: Vec3;
  castShadow?: boolean;
}
export interface SceneFillLight {
  intensity?: number;
  color?: string;
  groundColor?: string;
}
export interface SceneRimLight {
  intensity?: number;
  color?: string;
  position?: Vec3;
}
export interface SceneAccentLight {
  intensity?: number;
  color?: string;
  position?: Vec3;
  distance?: number;
  decay?: number;
}
export interface SceneAmbientLight {
  intensity?: number;
  color?: string;
}

/** Per-light overrides. Omit a key to skip that light entirely. */
export interface SceneLightConfig {
  key?: SceneKeyLight;
  fill?: SceneFillLight;
  rim?: SceneRimLight;
  accent?: SceneAccentLight;
  ambient?: SceneAmbientLight;
}

/* ---- Environment --------------------------------------------------------- */

export interface SceneFog {
  color: string;
  near: number;
  far: number;
}

export interface SceneEnvironmentConfig {
  /** Drei HDR preset used when no manifest/file HDR resolves. */
  preset?: EnvironmentPresetName;
  /** Explicit HDR path under /public (overrides preset + manifest). */
  files?: string;
  /** Asset-manifest key (default "environment") — Google Flow placeholder. */
  manifestKey?: AssetKind;
  /** Show the environment as the visible background. */
  background?: boolean;
  /** Mount a drei <Sky> skybox. */
  sky?: boolean;
  fog?: SceneFog;
}

/* ---- Assets — Google Flow placeholders (manifest-driven, scene-generic) --- */

export interface SceneModelAsset {
  manifestKey?: AssetKind;
  position?: Vec3;
  scale?: number | Vec3;
  rotation?: Vec3;
  /** Rendered while loading or when no production model exists. */
  fallback?: ReactNode;
}

export interface SceneVideoAsset {
  manifestKey?: AssetKind;
  /** Optional poster image (also shown under reduced-motion). */
  poster?: string;
  className?: string;
  fallback?: ReactNode;
  autoPlay?: boolean;
}

export interface SceneParticleAsset {
  count?: number;
  bounds?: number;
  color?: string;
  size?: number;
  speed?: number;
  opacity?: number;
}

export interface SceneAssetConfig {
  /** GLB model loaded from the asset manifest (Google Flow). */
  model?: SceneModelAsset;
  /** Cinematic video layer (DOM, above canvas, below overlay). */
  video?: SceneVideoAsset;
  /** GPU particle field, density scaled by the active quality preset. */
  particles?: SceneParticleAsset;
}

/* ---- Camera ------------------------------------------------------------- */

export interface SceneCameraRig {
  position?: Vec3;
  target?: Vec3;
  fov?: number;
  distance?: number;
}

export interface SceneCameraSyncConfig {
  /** How much global scroll progress contributes (0–1). Default 0.6. */
  scrollWeight?: number;
  /** Seconds for the mount intro ramp. Default 2.4. */
  introDuration?: number;
  /** Pointer-parallax damping (higher = snappier). Default 2.5. */
  parallaxLambda?: number;
}

export interface SceneCameraConfig {
  rig?: SceneCameraRig;
  /** Named camera behaviors; the active `mode` key is picked each frame. */
  behaviors?: Record<string, CameraBehavior>;
  /** Camera mode to claim on mount (defaults to the scene id). */
  activeMode?: string;
  controller?: { lambda?: number };
  parallax?: { amount?: number; lambda?: number };
  /** Scroll→camera progress bridge. `false` disables it. Default on. */
  sync?: SceneCameraSyncConfig | false;
}

/* ---- Canvas layer -------------------------------------------------------- */

export interface SceneCanvasConfig {
  /** Scene3D priority hint for camera-claim arbitration. */
  priority?: number;
  /** Mount the cinematic post-processing stack. Default true. */
  postProcessing?: boolean;
  /** WebGL fallback shown when the canvas can't mount. */
  fallback?: ReactNode;
  /** Fixed full-viewport canvas (default true, matches the hero). */
  fixed?: boolean;
  /** Strategy when the user prefers reduced motion. Default "hide". */
  reducedMotionStrategy?: "hide" | "poster";
  /** Poster shown for the "poster" reduced-motion strategy. */
  poster?: ReactNode;
}

/* ---- Transitions --------------------------------------------------------- */

export interface SceneTransitionScrollConfig {
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string;
  snap?: boolean | number;
}

export interface SceneTransitionConfig {
  /** Named animation preset. Default "none" (no scroll-driven animation). */
  preset?: TransitionPresetName;
  /** ScrollTrigger anchors (merged over the preset defaults). */
  scroll?: SceneTransitionScrollConfig;
  duration?: number;
  ease?: string;
  /** Custom timeline builder (overrides the preset). */
  build?: (ctx: GsapContext, handle: SceneHandle) => Timeline | void;
}

/* ---- Hooks: performance + analytics -------------------------------------- */

export interface ScenePerformanceHooks {
  /** Canvas mounted and the renderer is configured. */
  onReady?: () => void;
  /** Fired on every quality-tier change (cold-start + runtime adaptation). */
  onQualityChange?: (tier: QualityTier) => void;
  onDowngrade?: (from: QualityTier, to: QualityTier) => void;
  onUpgrade?: (from: QualityTier, to: QualityTier) => void;
}

export interface SceneAnalyticsHooks {
  onMount?: () => void;
  onUnmount?: () => void;
  /** Section scrolled into the viewport. */
  onEnter?: () => void;
  /** Section scrolled out of the viewport. */
  onExit?: () => void;
  /** 3D scene claimed camera ownership. */
  onActive?: () => void;
  /** 3D scene released camera ownership. */
  onInactive?: () => void;
  /** Section-local scroll progress (0 → 1 across the full traverse). */
  onProgress?: (progress: number) => void;
  /** Engine scene event (global broadcast via the 3D store). */
  onEvent?: (name: string) => void;
}

/* ---- Accessibility + responsive ------------------------------------------ */

export interface SceneAccessibilityConfig {
  /** Accessible name for the section landmark. */
  label?: string;
  /** id of an element that labels this section (mutually exclusive with label). */
  labelledby?: string;
  /** Longer description exposed via aria-description. */
  description?: string;
  /** Explicit landmark role. Omit to use the <section> implicit role. */
  role?: "region" | "banner" | "complementary" | "contentinfo";
  /** Mark the canvas as decorative (aria-hidden). Default true. */
  decorativeCanvas?: boolean;
  /** Announce enter/leave transitions to assistive tech. Default false. */
  announce?: boolean;
}

export interface SceneResponsiveConfig {
  /** Skip the 3D canvas on the "mobile" tier. */
  disableCanvasOnMobile?: boolean;
  /** Skip the 3D canvas on the "weak" tier. */
  disableCanvasOnWeak?: boolean;
  /** Overlay minimum height. Default "screen". */
  minHeight?: "screen" | "auto";
}

/* ---- Top-level props ----------------------------------------------------- */

export interface SceneTemplateProps {
  /** Globally-unique scene id (matches nav + the overlay's DOM id). */
  id: string;
  /** 3D scene content, mounted inside <Scene3D>. */
  children?: ReactNode;
  /** UI overlay content, mounted inside the <section> landmark. */
  overlay?: ReactNode;
  /** Canvas layer config. `false` → UI-only scene. */
  canvas?: SceneCanvasConfig | false;
  camera?: SceneCameraConfig;
  /** Lighting preset name or per-light config. */
  lighting?: LightingPresetName | SceneLightConfig;
  environment?: SceneEnvironmentConfig;
  assets?: SceneAssetConfig;
  transition?: SceneTransitionConfig;
  performance?: ScenePerformanceHooks;
  analytics?: SceneAnalyticsHooks;
  accessibility?: SceneAccessibilityConfig;
  responsive?: SceneResponsiveConfig;
  /** Extra class on the overlay <section>. */
  overlayClassName?: string;
  /** Extra class on the canvas container. */
  canvasClassName?: string;
  /** Extra class on the overlay <section> root (alias of overlayClassName). */
  className?: string;
}
