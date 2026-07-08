"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  createLenis,
  destroyLenis,
  getLenis,
} from "@/lib/scroll/lenis-instance";
import { getRegistry } from "@/lib/scroll/registry";
import { FPSMonitor } from "@/lib/scroll/fps-monitor";
import { readViewport, readMaxScroll } from "@/lib/scroll/viewport";
import { useScrollStore } from "@/stores/scroll-store";
import { useSceneStore } from "@/stores/scene-store";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Cinematic scroll engine bootstrap. Single source of scroll truth: Lenis
 * drives the wheel; its rAF also feeds ScrollTrigger and the FPS watchdog so
 * the page only ever spawns one animation frame per refresh.
 *
 * Reduced-motion: Lenis is instantiated in "instant" mode and ScrollTrigger
 * still receives updates (actions like pin/scrub become near-instant); the
 * downstream *content* animations are gated by each scene reading
 * `reducedMotion` from its handle.
 *
 * Route transitions: every pathname change reverts all scene contexts and
 * re-commits freshly mounted scenes against the new DOM.
 */
export function ScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Scroll store setters
  const setProgress = useScrollStore((s) => s.setProgress);
  const setVelocity = useScrollStore((s) => s.setVelocity);
  const setScrollTop = useScrollStore((s) => s.setScrollTop);
  const setViewport = useScrollStore((s) => s.setViewport);
  const setMaxScroll = useScrollStore((s) => s.setMaxScroll);
  const setActive = useScrollStore((s) => s.setActive);

  // Scene store flags
  const setReducedMotion = useSceneStore((s) => s.setReducedMotion);
  const setCanvasTier = useSceneStore((s) => s.setCanvasTier);
  const setPaused = useSceneStore((s) => s.setPaused);

  // ── Boot ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial viewport + flags
    const vp = readViewport();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    setViewport(vp);
    setMaxScroll(readMaxScroll());
    getRegistry().setFlags({
      reducedMotion: mq.matches,
      canvasTier: vp.isMobile ? "mobile" : "desktop",
      paused: false,
    });

    // Lenis
    const lenis = createLenis({
      reducedMotion: mq.matches,
      isMobile: vp.isMobile,
      onScroll: ({ scroll, velocity }) => {
        setScrollTop(scroll);
        setVelocity(velocity);
        const max = readMaxScroll();
        setMaxScroll(max);
        setProgress(max > 0 ? Math.min(scroll / max, 1) : 0);
      },
    });

    // FPS watchdog — single rAF lives here; monitor reads the same loop.
    let downgradeApplied = false;
    let pauseApplied = false;
    const monitor = new FPSMonitor({
      onDowngrade: () => {
        if (downgradeApplied) return;
        downgradeApplied = true;
        const tier = vp.isMobile || vp.isTablet ? "weak" : "mobile";
        setCanvasTier(tier);
        getRegistry().setFlags({ canvasTier: tier });
      },
      onPause: () => {
        if (pauseApplied) return;
        pauseApplied = true;
        setPaused(true);
        getRegistry().setFlags({ paused: true });
      },
    });

    // Single rAF: Lenis → ScrollTrigger → FPS monitor
    let raf = 0;
    function loop(time: number) {
lenis.raf(time);
        ScrollTrigger.update();
        monitor.tick();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    setActive(true);

    // Visibility: pause the loop when tab is hidden (battery & GPU).
    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        setPaused(true);
        getRegistry().setFlags({ paused: true });
      } else {
        setPaused(false);
        getRegistry().setFlags({ paused: false });
        pauseApplied = false;
        raf = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    // Resize: refresh viewport, maxScroll, and let ScrollTrigger recompute.
    let resizeT: ReturnType<typeof setTimeout>;
    function onResize() {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        const next = readViewport();
        setViewport(next);
        setMaxScroll(readMaxScroll());
        ScrollTrigger.refresh();
      }, 200);
    }
    window.addEventListener("resize", onResize);

    // Reduced-motion changes mid-session.
    function onMqChange(e: MediaQueryListEvent) {
      setReducedMotion(e.matches);
      getRegistry().setFlags({ reducedMotion: e.matches });
      // Tear down & rebuild Lenis for the new mode.
      cancelAnimationFrame(raf);
      destroyLenis();
      window.location.reload(); // hard but predictable — Lenis mode is sticky
    }
    mq.addEventListener("change", onMqChange);

    // Commit any scenes registered before boot.
    const registry = getRegistry();
    const canvasTierValue = vp.isMobile || vp.isTablet ? "mobile" : "desktop";
    registry.setFlags({
      reducedMotion: mq.matches,
      canvasTier: canvasTierValue,
      paused: false,
    });
    registry.commit(gsap, document.documentElement);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMqChange);
      monitor.stop();
      registry.teardownAll();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      destroyLenis();
      setActive(false);
    };
    // Boot once. Route cleanup handled in the second effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Route transitions ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lenis = getLenis();
    const registry = getRegistry();

    // Revert everything built for the previous surface.
    registry.teardownAll();
    ScrollTrigger.getAll().forEach((t) => t.kill());

    // Wait two frames so the new route's DOM has painted.
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setMaxScroll(readMaxScroll());
        lenis?.scrollTo(0, { immediate: true });
        ScrollTrigger.refresh();
        registry.commit(gsap, document.documentElement);
      });
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <>{children}</>;
}