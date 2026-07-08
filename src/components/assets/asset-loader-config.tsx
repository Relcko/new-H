"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { configureLoaders } from "./assets";

/**
 * AssetLoaderConfig — runs inside the canvas once and hooks the DRACO decoder
 * path + KTX2 transcoder into the shared `useGLTF`/`useTexture` instances.
 * Pure setup, no visual output.
 */
export function AssetLoaderConfig() {
  const gl = useThree((s) => s.gl);
  useLayoutEffect(() => {
    const { ktx2 } = configureLoaders(gl);
    return () => {
      ktx2.dispose();
    };
  }, [gl]);
  return null;
}