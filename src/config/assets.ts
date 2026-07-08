/**
 * Centralized asset path configuration. Production assets (Google Flow videos,
 * GLB models, HDR environments, textures) are dropped into the corresponding
 * `/public/assets/*` folder and declared in `/public/assets/assets-manifest.json`.
 *
 * The AssetManager reads the manifest at boot; these paths are reference
 * constants for the file locations that the manifest entries point to.
 *
 * To activate a production asset:
 *   1. Drop the file into the matching `/public/assets/` folder.
 *   2. Set its path string in assets-manifest.json (replacing null).
 *   3. No component code changes required.
 */

export const ASSET_PATHS = {
  hero: {
    video: {
      mp4: "/assets/videos/hero.mp4",
      webm: "/assets/videos/hero.webm",
      poster: "/assets/images/hero-poster.jpg",
    },
    model: {
      glb: "/assets/models/hero-monolith.glb",
    },
    environment: {
      hdr: "/assets/hdr/hero-environment.hdr",
    },
  },
} as const;

export interface VideoAssetPaths {
  mp4?: string;
  webm?: string;
  poster?: string;
}

export interface ModelAssetPaths {
  glb?: string;
}

export interface EnvironmentAssetPaths {
  hdr?: string;
}
