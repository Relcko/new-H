import { create } from "zustand";
import type { Viewport } from "@/lib/scroll/types";

interface ScrollState {
  /** Document-level normalized scroll position (0 → 1). */
  progress: number;
  setProgress: (p: number) => void;

  /** Smoothed px/sec; sign indicates direction. */
  velocity: number;
  setVelocity: (v: number) => void;

  /** Raw.scrollTop for components that need exact positions. */
  scrollTop: number;
  setScrollTop: (v: number) => void;

  viewport: Viewport;
  setViewport: (v: Viewport) => void;

  /** True while the engine is actively driving the page (lenis rAF). */
  active: boolean;
  setActive: (a: boolean) => void;

  /** Total scrollable pixel range. */
  maxScroll: number;
  setMaxScroll: (m: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  progress: 0,
  setProgress: (progress) => set({ progress }),
  velocity: 0,
  setVelocity: (velocity) => set({ velocity }),
  scrollTop: 0,
  setScrollTop: (scrollTop) => set({ scrollTop }),
  viewport: {
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    dpr: 1,
  },
  setViewport: (viewport) => set({ viewport }),
  active: false,
  setActive: (active) => set({ active }),
  maxScroll: 0,
  setMaxScroll: (maxScroll) => set({ maxScroll }),
}));