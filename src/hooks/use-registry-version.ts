"use client";

import { useSyncExternalStore } from "react";
import { getRegistry } from "@/lib/scroll/registry";

/**
 * Subscribe to the registry's version counter. Components re-render when the
 * set of mounted scenes changes — without needing a Zustand slice per scene.
 */
export function useRegistryVersion(): number {
  const registry = getRegistry();
  return useSyncExternalStore(
    (onChange) => {
      // Poll-light: version mutations are co-located with the store calls so
      // the provider's setProgress propagates a render anyway. For algorithmic
      // correctness we still bridge through an interval.
      const id = setInterval(onChange, 250);
      return () => clearInterval(id);
    },
    () => registry.getVersion(),
    () => 0,
  );
}