"use client";

import * as THREE from "three";
import { useGLTF, useTexture, Loader } from "@react-three/drei";
import type { GLTF, GLTFLoader } from "three-stdlib";
import { KTX2Loader } from "three-stdlib";
import type { ObjectMap } from "@react-three/fiber";
import { useEffect } from "react";
import { useAssetCache } from "@/lib/three/asset-cache";

/**
 * Asset pipeline. Wraps drei's `useGLTF` and `useTexture` with:
 *   • DRACO decoder path (self-hosted under /public/draco).
 *   • KTX2 transcoder attached to the GLTFLoader via `extendLoader`.
 *   • Ref-counted shared cache so two scenes loading the same model reuse the
 *     parsed geometry instead of re-decoding.
 *
 * Decoder/transcoder bins are fetched from the same origin to keep third-party
 * CDN concerns out of the bundle.
 */

const DRACO_PATH = "/draco/";
const KTX2_PATH = "/basis/";

let ktx2Singleton: KTX2Loader | null = null;

export function configureLoaders(renderer: THREE.WebGLRenderer) {
  useGLTF.setDecoderPath(DRACO_PATH);
  if (!ktx2Singleton) {
    ktx2Singleton = new KTX2Loader()
      .setTranscoderPath(KTX2_PATH)
      .detectSupport(renderer);
  }
  return { ktx2: ktx2Singleton };
}

type GLTFResult = GLTF & ObjectMap;

function disposeScene(scene: THREE.Object3D) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) {
      const mat = mesh.material as THREE.Material | THREE.Material[];
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
  });
}

/** GLTF asset with shared-cache refcounting. */
export function useGLTFAsset<T extends string | string[]>(
  path: T,
  cacheKey: string,
): GLTFResult | GLTFResult[] {
  const acquire = useAssetCache((s) => s.acquire);
  const release = useAssetCache((s) => s.release);

  const gltf = useGLTF(path, true, false, (loader: GLTFLoader) => {
    if (ktx2Singleton) loader.setKTX2Loader(ktx2Singleton);
  });

  useEffect(() => {
    const key = `gltf:${cacheKey}`;
    const ref =
      Array.isArray(gltf) ? gltf[0].scene : (gltf as GLTFResult).scene;
    acquire(key, () => ref, () => disposeScene(ref));
    return () => release(key);
  }, [acquire, cacheKey, gltf, release]);

  return gltf as GLTFResult | GLTFResult[];
}

export function useTextureAsset(path: string | string[], cacheKey: string) {
  const acquire = useAssetCache((s) => s.acquire);
  const release = useAssetCache((s) => s.release);
  const texture = useTexture(path);

  useEffect(() => {
    const key = `tex:${cacheKey}`;
    const dispose = () => {
      const t = texture as unknown;
      if (Array.isArray(t)) {
        (t as Array<{ dispose?: () => void }>).forEach((x) => x.dispose?.());
      } else {
        (t as { dispose?: () => void }).dispose?.();
      }
    };
    acquire(key, () => texture, dispose);
    return () => release(key);
  }, [acquire, cacheKey, release, texture]);

  return texture;
}

/** Eager asset preload during idle. Page scenes call this next to links. */
export function preloadGLTF(path: string) {
  if (typeof window === "undefined") return;
  const idle = (cb: () => void) =>
    "requestIdleCallback" in window
      ? (window as Window).requestIdleCallback(cb)
      : setTimeout(cb, 200);
  idle(() =>
    useGLTF.preload(path, true, false, (loader: GLTFLoader) => {
      if (ktx2Singleton) loader.setKTX2Loader(ktx2Singleton);
    }),
  );
}

export { Loader as ThreeLoader };