import type { Viewport } from "@/lib/scroll/types";

export function readViewport(): Viewport {
  if (typeof window === "undefined") {
    return {
      width: 0,
      height: 0,
      isMobile: false,
      isTablet: false,
      dpr: 1,
    };
  }
  const w = window.innerWidth;
  const h = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  return {
    width: w,
    height: h,
    isMobile: w < 640,
    isTablet: w >= 640 && w < 1024,
    dpr,
  };
}

export function readMaxScroll(): number {
  if (typeof document === "undefined") return 0;
  return document.documentElement.scrollHeight - window.innerHeight;
}