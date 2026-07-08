"use client";

import { useEffect, useRef } from "react";
import { useDevStore } from "@/stores/dev-store";

/**
 * DevFPSMonitor — runs a DOM-side rAF loop to compute FPS + frame time.
 * Independent of the R3F canvas's rAF so it works even when the canvas is
 * reduced-motion (null). Writes to the dev store ~5×/sec.
 */
export function DevFPSMonitor() {
  const setFps = useDevStore((s) => s.setFps);
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);
  const accRef = useRef(0);
  const framesRef = useRef(0);

  useEffect(() => {
    lastRef.current = performance.now();
    function loop(now: number) {
      const dt = now - lastRef.current;
      lastRef.current = now;
      accRef.current += dt;
      framesRef.current++;

      if (accRef.current >= 200) {
        const fps = (framesRef.current / accRef.current) * 1000;
        setFps(Math.round(fps), Math.round(dt));
        accRef.current = 0;
        framesRef.current = 0;
      }
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [setFps]);

  return null;
}
