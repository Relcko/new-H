"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { SceneDefinition, SceneHandle, Timeline } from "@/lib/scroll/types";
import { getRegistry } from "@/lib/scroll/registry";
import { useSceneStore } from "@/stores/scene-store";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Register a scene with the cinematic engine. The build() callback runs inside
 * a `gsap.context` scoped to the returned ref's element, so every timeline +
 * ScrollTrigger is collected and auto-reverted on unmount or route change.
 *
 * The scene's id MUST match a DOM element with that id (use the same ref).
 *
 * @example
 * const rootRef = useScene({
 *   id: "hero",
 *   build: (ctx, self) => {
 *     const tl = gsap.timeline({ scrollTrigger: {
 *       trigger: self.el, start: "top top", end: "bottom top", scrub: true,
 *     }});
 *     tl.to(self.el, { opacity: 0 });
 *     return tl;
 *   },
 * });
 * return <section ref={rootRef} id="hero" />
 */
export function useScene<T extends Timeline = Timeline>(
  def: SceneDefinition<T>,
) {
  const ref = useRef<HTMLElement>(null);

  // Keep the latest def available to the registered builder without
  // re-registering on every render. Update via effect (not during render).
  const defRef = useRef(def);
  useEffect(() => {
    defRef.current = def;
  });

  const canvasTier = useSceneStore((s) => s.canvasTier);
  const reducedMotion = useSceneStore((s) => s.reducedMotion);
  const paused = useSceneStore((s) => s.paused);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const registry = getRegistry();

    const resolved: SceneDefinition = {
      id: defRef.current.id,
      priority: defRef.current.priority,
      build: (ctx, baseHandle) => {
        const handle: SceneHandle = {
          ...baseHandle,
          el: ref.current,
        };
        return defRef.current.build(ctx, handle);
      },
    };

    registry.register(resolved);
    registry.commit(gsap, document.documentElement);

    return () => {
      registry.unregister(resolved.id);
    };
  }, []);

  useEffect(() => {
    getRegistry().setFlags({ canvasTier, reducedMotion, paused });
  }, [canvasTier, reducedMotion, paused]);

  return ref;
}