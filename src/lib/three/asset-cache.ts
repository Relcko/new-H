import { create } from "zustand";
import type * as THREE from "three";

/**
 * In-memory cache for raw GPU resources that were loaded outside R3F's
 * lifecycle (e.g. env maps / KTX2 textures preloaded with `useTexture`).
 *
 * Holds strong references and ref-counts them so dispose happens only when
 * the last consumer unregisters. Disposal is centralized through
 * `disposeAll()`, called by the CanvasRoot on unmount.
 */
interface AssetEntry {
  ref: THREE.BufferGeometry | THREE.Texture | THREE.Material | unknown;
  refs: number;
  dispose?: () => void;
}

interface AssetCacheState {
  entries: Map<string, AssetEntry>;
  acquire: (key: string, load: () => AssetEntry["ref"], dispose?: () => void) => unknown;
  release: (key: string) => void;
  has: (key: string) => boolean;
  clear: () => void;
}

export const useAssetCache = create<AssetCacheState>((set, get) => ({
  entries: new Map(),
  acquire: (key, load, dispose) => {
    const entries = get().entries;
    const existing = entries.get(key);
    if (existing) {
      existing.refs++;
      return existing.ref;
    }
    const ref = load();
    entries.set(key, { ref, refs: 1, dispose });
    set({ entries: new Map(entries) });
    return ref;
  },
  release: (key) => {
    const entries = get().entries;
    const entry = entries.get(key);
    if (!entry) return;
    entry.refs--;
    if (entry.refs <= 0) {
      entry.dispose?.();
      // Best-effort per-resource disposal for known three classes.
    const anyRef = entry.ref as { dispose?: () => void };
     anyRef?.dispose?.();
      entries.delete(key);
      set({ entries: new Map(entries) });
    }
  },
  has: (key) => get().entries.has(key),
  clear: () => {
    const entries = get().entries;
    for (const entry of entries.values()) {
      entry.dispose?.();
    const anyRef = entry.ref as { dispose?: () => void };
     anyRef?.dispose?.();
    }
    entries.clear();
    set({ entries: new Map() });
  },
}));