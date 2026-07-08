"use client";

import { useScrollStore } from "@/stores/scroll-store";

/** Global normalized document scroll progress (0 → 1). */
export function useScrollProgress() {
  return useScrollStore((s) => s.progress);
}

/** Smoothed scroll velocity with sign (px/sec). */
export function useScrollVelocity() {
  return useScrollStore((s) => s.velocity);
}

/** Raw scrollTop in px. */
export function useScrollTop() {
  return useScrollStore((s) => s.scrollTop);
}