/**
 * Frame-rate watchdog. Computes a rolling average of frame times. If the
 * sustained FPS drops below the desktop threshold, the engine asks the canvas
 * tier to step down. If it falls further, heavy work is paused.
 *
 * Pure class — no React. Wires into ScrollProvider's rAF loop so we piggyback
 * on a single rAF instead of spawning another.
 */
export class FPSMonitor {
  private windowMs: number;
  private throttleMs: number;
  private buckets: number[] = [];
  private lastSample = performance.now();
  private lastSignal = performance.now();
  /** Threshold for downgrading tier (weak-gpu). */
  readonly downgradeFps = 38;
  /** Threshold for pausing heavy work entirely. */
  readonly pauseFps = 24;

  private onDowngrade?: () => void;
  private onPause?: () => void;

  constructor(opts: {
    windowMs?: number;
    throttleMs?: number;
    onDowngrade?: () => void;
    onPause?: () => void;
  } = {}) {
    this.windowMs = opts.windowMs ?? 1000;
    this.throttleMs = opts.throttleMs ?? 1200;
    this.onDowngrade = opts.onDowngrade;
    this.onPause = opts.onPause;
  }

  /** Called once per rAF tick by the ScrollProvider. */
  tick() {
    const now = performance.now();
    this.buckets.push(now);
    while (this.buckets.length && now - this.buckets[0] > this.windowMs) {
      this.buckets.shift();
    }

    if (now - this.lastSignal < this.throttleMs) return;

    const fps = (this.buckets.length / this.windowMs) * 1000;
    if (!Number.isFinite(fps) || fps <= 0) {
      this.lastSignal = now;
      return;
    }

    if (fps < this.pauseFps) this.onPause?.();
    else if (fps < this.downgradeFps) this.onDowngrade?.();

    this.lastSignal = now;
  }

  stop() {
    this.buckets = [];
  }
}