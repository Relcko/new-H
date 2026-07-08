/**
 * Quality tiers for the 3D engine. The QualityManager picks one at boot and
 * re-picks on viewport/FPS changes; every subsystem reads the active preset
 * through `useQuality()` / `useThreeSceneStore`.
 */
export type QualityTier = "ultra" | "high" | "medium" | "low" | "weak";

export interface QualityPreset {
  tier: QualityTier;
  /** Device pixel ratio range fed to R3F `dpr`. */
  dpr: [number, number];
  /** Max particle count multiplier (0 → 1) applied to base counts. */
  particleScale: number;
  /** shadowMap resolution; 0 disables shadows. */
  shadowMapSize: number;
  /** Reflection/env-map resolution. */
  envResolution: 256 | 512 | 1024 | 2048;
  bloom: {
    enabled: boolean;
    intensity: number;
    luminanceThreshold: number;
    mipmapBlur: boolean;
  };
  dof: { enabled: boolean; focusDistance: number; focalLength: number };
  vignette: { enabled: boolean; darkness: number };
  chromaticAberration: { enabled: boolean; offset: number };
  noise: { enabled: boolean; opacity: number };
  ao: { enabled: boolean; halfRes: boolean };
  /** Disable MSAA on weak GPUs (rely on FXAA/post). */
  antialias: boolean;
  /** Tone-mapping exposure. */
  exposure: number;
}

export const QUALITY_PRESETS: Record<QualityTier, QualityPreset> = {
  ultra: {
    tier: "ultra",
    dpr: [1, 2],
    particleScale: 1,
    shadowMapSize: 2048,
    envResolution: 2048,
    bloom: { enabled: true, intensity: 0.8, luminanceThreshold: 0.85, mipmapBlur: true },
    dof: { enabled: true, focusDistance: 0.02, focalLength: 0.05 },
    vignette: { enabled: true, darkness: 0.48 },
    chromaticAberration: { enabled: true, offset: 0.0006 },
    noise: { enabled: true, opacity: 0.04 },
    ao: { enabled: true, halfRes: false },
    antialias: true,
    exposure: 1.0,
  },
  high: {
    tier: "high",
    dpr: [1, 2],
    particleScale: 0.75,
    shadowMapSize: 1024,
    envResolution: 1024,
    bloom: { enabled: true, intensity: 0.7, luminanceThreshold: 0.9, mipmapBlur: true },
    dof: { enabled: true, focusDistance: 0.02, focalLength: 0.05 },
    vignette: { enabled: true, darkness: 0.5 },
    chromaticAberration: { enabled: true, offset: 0.0005 },
    noise: { enabled: true, opacity: 0.035 },
    ao: { enabled: true, halfRes: true },
    antialias: true,
    exposure: 1.0,
  },
  medium: {
    tier: "medium",
    dpr: [1, 1.5],
    particleScale: 0.5,
    shadowMapSize: 1024,
    envResolution: 512,
    bloom: { enabled: true, intensity: 0.55, luminanceThreshold: 1.0, mipmapBlur: true },
    dof: { enabled: false, focusDistance: 0.02, focalLength: 0.05 },
    vignette: { enabled: true, darkness: 0.55 },
    chromaticAberration: { enabled: true, offset: 0.0004 },
    noise: { enabled: true, opacity: 0.03 },
    ao: { enabled: false, halfRes: true },
    antialias: true,
    exposure: 1.0,
  },
  low: {
    tier: "low",
    dpr: [0.75, 1],
    particleScale: 0.3,
    shadowMapSize: 512,
    envResolution: 256,
    bloom: { enabled: true, intensity: 0.4, luminanceThreshold: 1.0, mipmapBlur: false },
    dof: { enabled: false, focusDistance: 0, focalLength: 0 },
    vignette: { enabled: true, darkness: 0.6 },
    chromaticAberration: { enabled: false, offset: 0 },
    noise: { enabled: false, opacity: 0 },
    ao: { enabled: false, halfRes: true },
    antialias: false,
    exposure: 1.0,
  },
  weak: {
    tier: "weak",
    dpr: [0.5, 0.75],
    particleScale: 0.15,
    shadowMapSize: 0,
    envResolution: 256,
    bloom: { enabled: false, intensity: 0, luminanceThreshold: 1, mipmapBlur: false },
    dof: { enabled: false, focusDistance: 0, focalLength: 0 },
    vignette: { enabled: true, darkness: 0.65 },
    chromaticAberration: { enabled: false, offset: 0 },
    noise: { enabled: false, opacity: 0 },
    ao: { enabled: false, halfRes: true },
    antialias: false,
    exposure: 1.0,
  },
};

/**
 * Coarse device classification from viewport + navigator hints.
 * The QualityManager refines this with FPS feedback at runtime.
 */
export function classifyInitialQuality(opts: {
  isMobile: boolean;
  isTablet: boolean;
  dpr: number;
  cores?: number;
  memory?: number;
}): QualityTier {
  const { isMobile, isTablet, dpr, cores, memory } = opts;
  if (isMobile) {
    if ((memory ?? 8) >= 8 && dpr >= 3) return "medium";
    return "low";
  }
  if (isTablet) return "medium";
  if ((cores ?? 8) < 4) return "low";
  if ((memory ?? 8) < 4) return "low";
  return "high";
}