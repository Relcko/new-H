import Lenis from "lenis";

/**
 * Lenis singleton — created lazily on the client only. Kept framework-agnostic
 * so the provider can opt out (reduced-motion) without instantiating it.
 *
 * Lerp/sync tuning targets cinematic slowness on desktop and snappier feel on
 * mobile where input-latency is more perceptible than smoothness.
 */
let lenis: Lenis | null = null;

export function createLenis(opts: {
  reducedMotion: boolean;
  isMobile: boolean;
  onScroll: (e: { scroll: number; velocity: number }) => void;
}): Lenis {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }

  // Reduced-motion: instant scroll, no smoothing, native wheel.
  if (opts.reducedMotion) {
    lenis = new Lenis({
      smoothWheel: false,
      syncTouch: false,
      wrapper: window,
      lerp: 0,
      duration: 0,
    });
    lenis.on("scroll", opts.onScroll);
    return lenis;
  }

  lenis = new Lenis({
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1.4,
    wheelMultiplier: 1,
    lerp: opts.isMobile ? 0.09 : 0.06,
    duration: opts.isMobile ? 0.9 : 1.2,
    easing: (t: number) => 1 - Math.pow(1 - t, 4),
    wrapper: window,
  });

  lenis.on("scroll", opts.onScroll);
  return lenis;
}

export function getLenis(): Lenis | null {
  return lenis;
}

export function destroyLenis() {
  if (lenis) {
    lenis.destroy();
    lenis = null;
  }
}