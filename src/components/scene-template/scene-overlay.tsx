"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScene } from "@/hooks/use-scene";
import { GSAP_EASE } from "@/config/motion";
import { cn } from "@/lib/cn";
import { useSceneVisibility, useSceneLocalProgress } from "./hooks";
import { TRANSITION_PRESETS } from "./presets";
import type {
  SceneTransitionConfig,
  SceneAccessibilityConfig,
  SceneResponsiveConfig,
} from "./types";
import type { GsapContext, SceneHandle, Timeline } from "@/lib/scroll/types";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Build a scene's scroll-driven transition timeline from a preset (or a custom
 * `build`). Runs inside the GSAP context provided by `useScene`, so every
 * timeline + ScrollTrigger is collected and auto-reverted on unmount/route
 * change. Reduced-motion short-circuits to a no-op (the static layout stands).
 */
function makeTransitionBuilder(
  transition: SceneTransitionConfig | undefined,
): (ctx: GsapContext, handle: SceneHandle) => Timeline | void {
  return (_ctx, handle) => {
    if (handle.reducedMotion || !handle.el) return;
    if (transition?.build) return transition.build(_ctx, handle);
    const preset = transition?.preset ?? "none";
    if (preset === "none") return;
    const anim = TRANSITION_PRESETS[preset];
    if (!anim) return;

    const s = transition?.scroll;
    const a = anim.scroll;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: handle.el,
        start: s?.start ?? a?.start ?? "top bottom",
        end: s?.end ?? a?.end ?? "top center",
        scrub: s?.scrub ?? a?.scrub ?? true,
        pin: s?.pin ?? a?.pin ?? false,
        ...(s?.snap ?? a?.snap ? { snap: s?.snap ?? a?.snap } : {}),
      } as never,
    });
    tl.fromTo(handle.el, anim.from, {
      ...anim.to,
      ease: transition?.ease ?? GSAP_EASE.cinematic,
      duration: transition?.duration ?? 1,
    });
    return tl;
  };
}

const VISUALLY_HIDDEN: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};

export interface SceneOverlayProps {
  id: string;
  overlay?: ReactNode;
  transition?: SceneTransitionConfig;
  accessibility?: SceneAccessibilityConfig;
  responsive?: SceneResponsiveConfig;
  onEnter?: () => void;
  onExit?: () => void;
  onProgress?: (progress: number) => void;
  onMount?: () => void;
  onUnmount?: () => void;
  className?: string;
  overlayClassName?: string;
}

/**
 * SceneOverlay — the UI landmark for a scene. Renders the `<section id>` that
 * the nav + scene registry key off of, registers a scroll-driven transition
 * via `useScene`, and wires visibility/progress/mount analytics. Accessibility:
 * a labelled landmark with an optional live region announcing enter/leave.
 *
 * The overlay is fully independent of the 3D layer — it renders with or without
 * the canvas (reduced-motion path), exactly like the hero section.
 */
export function SceneOverlay({
  id,
  overlay,
  transition,
  accessibility,
  responsive,
  onEnter,
  onExit,
  onProgress,
  onMount,
  onUnmount,
  className,
  overlayClassName,
}: SceneOverlayProps) {
  const build = useMemo(
    () => makeTransitionBuilder(transition),
    [transition],
  );
  const ref = useScene({ id, build });
  const [announcement, setAnnouncement] = useState("");

  const label = accessibility?.label ?? id;
  useSceneVisibility(
    ref,
    () => {
      setAnnouncement(`Entering ${label}`);
      onEnter?.();
    },
    () => {
      setAnnouncement(`Leaving ${label}`);
      onExit?.();
    },
  );
  useSceneLocalProgress(ref, onProgress);

  // Mount/unmount analytics — refs keep latest callbacks without re-running.
  const mountRef = useRef(onMount);
  const unmountRef = useRef(onUnmount);
  useEffect(() => {
    mountRef.current = onMount;
    unmountRef.current = onUnmount;
  });
  useEffect(() => {
    mountRef.current?.();
    return () => unmountRef.current?.();
  }, []);

  const minHeightClass =
    responsive?.minHeight === "auto" ? "" : "min-h-[100svh]";

  return (
    <section
      ref={ref}
      id={id}
      role={accessibility?.role}
      aria-label={accessibility?.label}
      aria-labelledby={accessibility?.labelledby}
      aria-description={accessibility?.description}
      className={cn(
        "relative z-10",
        minHeightClass,
        className,
        overlayClassName,
      )}
    >
      {overlay}
      {accessibility?.announce && (
        <div aria-live="polite" style={VISUALLY_HIDDEN}>
          {announcement}
        </div>
      )}
    </section>
  );
}
