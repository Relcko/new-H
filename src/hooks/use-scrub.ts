"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSceneStore } from "@/stores/scene-store";
import type { Timeline } from "@/lib/scroll/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrubOptions {
  /** CSS ScrollTrigger anchors. Defaults: top top → bottom top. */
  start?: string;
  end?: string;
  /** Pin the trigger while scrubbing. */
  pin?: boolean | string;
  /** Snap to quarter-points (e.g. "1/4") or false. */
  snap?: boolean | number;
}

/**
 * Bind a GSAP timeline to a scroll position over a ref element. Useful when a
 * scene does not need full registry plumbing (e.g. decorative parallax inside
 * a section already registered with `useScene`). Auto-reverts on unmount.
 */
export function useScrub(
  build: (tl: Timeline) => void,
  deps: ReadonlyArray<unknown> = [],
  opts: ScrubOptions = {},
) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useSceneStore((s) => s.reducedMotion);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) return; // skip animation; the static layout stands
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const triggerConfig: Record<string, unknown> = {
        trigger: ref.current,
        start: opts.start ?? "top top",
        end: opts.end ?? "bottom top",
        scrub: true,
        pin: opts.pin ?? false,
      };
      if (opts.snap) triggerConfig.snap = opts.snap;
      const tl = gsap.timeline({
        scrollTrigger: triggerConfig as never,
      });
      build(tl);
    }, ref);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);

  return ref;
}