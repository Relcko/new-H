"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useScrollStore } from "@/stores/scroll-store";
import { clamp } from "@/lib/utils";
import type { QualityTier } from "@/lib/three/quality";
import type { ScenePerformanceHooks } from "./types";

/** Numeric rank so quality changes can be classified as upgrade/downgrade. */
const TIER_RANK: Record<QualityTier, number> = {
  ultra: 4,
  high: 3,
  medium: 2,
  low: 1,
  weak: 0,
};

/**
 * useSceneVisibility — fires `onEnter` when the section scrolls into the
 * viewport and `onExit` when it leaves. Callbacks are kept in refs so callers
 * don't need `useCallback`. Pure observer — no state, no re-renders.
 */
export function useSceneVisibility(
  ref: RefObject<HTMLElement | null>,
  onEnter?: () => void,
  onExit?: () => void,
) {
  const enterRef = useRef(onEnter);
  const exitRef = useRef(onExit);
  useEffect(() => {
    enterRef.current = onEnter;
    exitRef.current = onExit;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    let wasVisible = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.isIntersecting;
          if (visible && !wasVisible) {
            wasVisible = true;
            enterRef.current?.();
          } else if (!visible && wasVisible) {
            wasVisible = false;
            exitRef.current?.();
          }
        }
      },
      { threshold: 0, rootMargin: "0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}

/**
 * useSceneLocalProgress — reports a 0 → 1 progress value as the section
 * traverses the viewport (0 = just entering from the bottom, 1 = just leaving
 * the top). Subscribes to the engine scroll store (Lenis-driven) plus a resize
 * listener, rAF-coalesced to avoid layout thrash.
 */
export function useSceneLocalProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress?: (progress: number) => void,
) {
  const cbRef = useRef(onProgress);
  useEffect(() => {
    cbRef.current = onProgress;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh - rect.top) / (vh + rect.height), 0, 1);
      cbRef.current?.(p);
    };
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(compute);
    };
    let lastTop = -1;
    const unsub = useScrollStore.subscribe((s) => {
      if (s.scrollTop === lastTop) return;
      lastTop = s.scrollTop;
      schedule();
    });
    const onResize = () => schedule();
    window.addEventListener("resize", onResize, { passive: true });
    schedule();
    return () => {
      unsub();
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/**
 * useScenePerformance — bridges the engine's quality/ready signals to the
 * scene's performance hooks. Quality changes come from the cold-start
 * QualityManager + the runtime PerformanceMonitor (FPS-driven), so this is the
 * single seam a scene needs to react to adaptive performance.
 */
export function useScenePerformance(perf?: ScenePerformanceHooks) {
  const ready = useThreeSceneStore((s) => s.ready);
  const quality = useThreeSceneStore((s) => s.quality);
  const perfRef = useRef(perf);
  const prevQ = useRef<QualityTier>(quality);

  useEffect(() => {
    perfRef.current = perf;
  });

  useEffect(() => {
    if (ready) perfRef.current?.onReady?.();
  }, [ready]);

  useEffect(() => {
    if (quality === prevQ.current) return;
    const from = prevQ.current;
    prevQ.current = quality;
    perfRef.current?.onQualityChange?.(quality);
    if (TIER_RANK[quality] < TIER_RANK[from]) {
      perfRef.current?.onDowngrade?.(from, quality);
    } else if (TIER_RANK[quality] > TIER_RANK[from]) {
      perfRef.current?.onUpgrade?.(from, quality);
    }
  }, [quality]);
}

/**
 * useSceneEngineEvents — forwards global engine scene events
 * (`useThreeSceneStore.sceneEvent`) to the scene's `onEvent` hook. Every scene
 * receives every event; scenes filter by name as needed.
 */
export function useSceneEngineEvents(onEvent?: (name: string) => void) {
  const sceneEvent = useThreeSceneStore((s) => s.sceneEvent);
  const cbRef = useRef(onEvent);
  useEffect(() => {
    cbRef.current = onEvent;
  });
  useEffect(() => {
    if (sceneEvent) cbRef.current?.(sceneEvent.name);
  }, [sceneEvent]);
}
