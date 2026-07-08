"use client";

import type { Viewport } from "@/lib/scroll/types";
import { useScrollStore } from "@/stores/scroll-store";

export function useViewport(): Viewport {
  return useScrollStore((s) => s.viewport);
}