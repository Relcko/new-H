/**
 * AssetManager — manifest-based asset resolution. Replaces runtime HEAD
 * probing with a single JSON manifest fetched once at boot.
 *
 * The manifest lives at `/public/assets/assets-manifest.json` and declares
 * which production assets exist for each scene. When a path is `null`, the
 * caller uses its procedural fallback. When a path is a string, the caller
 * loads that file from `/public/assets/`.
 *
 * Usage:
 *   const manifest = await AssetManager.load();
 *   const heroVideo = AssetManager.get("hero", "video"); // string | null
 */

export type AssetKind = "video" | "model" | "environment" | "texture" | "audio";

export type SceneAssetMap = Partial<Record<AssetKind, string | null>>;

export type AssetManifest = Record<string, SceneAssetMap>;

const MANIFEST_PATH = "/assets/assets-manifest.json";

class AssetManagerClass {
  private manifest: AssetManifest = {};
  private loaded = false;
  private loadPromise: Promise<AssetManifest> | null = null;

  /** Fetch the manifest once. Subsequent calls return the cached result. */
  async load(): Promise<AssetManifest> {
    if (this.loaded) return this.manifest;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = (async () => {
      try {
        const res = await fetch(MANIFEST_PATH, { cache: "no-cache" });
        if (res.ok) {
          this.manifest = await res.json();
        }
      } catch {
        // Manifest missing or unreadable — everything falls back to procedural.
        this.manifest = {};
      }
      this.loaded = true;
      return this.manifest;
    })();

    return this.loadPromise;
  }

  /** Synchronous lookup — returns the path string or null. */
  get(scene: string, kind: AssetKind): string | null {
    const entry = this.manifest[scene];
    if (!entry) return null;
    const value = entry[kind];
    if (typeof value === "string" && value.length > 0) return value;
    return null;
  }

  /** Check if a specific asset exists in the manifest. */
  has(scene: string, kind: AssetKind): boolean {
    return this.get(scene, kind) !== null;
  }

  /** Get the full scene entry. */
  getScene(scene: string): SceneAssetMap {
    return this.manifest[scene] ?? {};
  }

  /** Get all scene names in the manifest. */
  getScenes(): string[] {
    return Object.keys(this.manifest);
  }

  /** Whether the manifest has been loaded. */
  get isLoaded(): boolean {
    return this.loaded;
  }
}

export const AssetManager = new AssetManagerClass();
