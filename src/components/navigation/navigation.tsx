"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScrollStore } from "@/stores/scroll-store";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { useSceneStore } from "@/stores/scene-store";
import { getLenis } from "@/lib/scroll/lenis-instance";
import { cn } from "@/lib/cn";
import { NavigationLogo } from "./navigation-logo";
import { NavigationProgress } from "./navigation-progress";
import { NavigationMenu } from "./navigation-menu";
import { NavigationCTA } from "./navigation-cta";
import { NavigationBackdrop } from "./navigation-backdrop";
import { MobileRadialMenu } from "./mobile-radial-menu";

/**
 * Navigation — premium floating glass navigation. Consumes the scroll + scene
 * stores from the existing engine. No manual section tracking — the active
 * highlight is driven by `activeSceneId` from the 3D scene registry.
 *
 * Behavior:
 *   • Hero (scroll ~0): nearly invisible, only logo + CTA.
 *   • Scrolling: blur + bg opacity ramp up, logo shrinks, height reduces,
 *     progress bar appears.
 *   • Scroll down: nav slides up and hides.
 *   • Scroll up: nav returns smoothly.
 *   • Mobile: radial glass menu (not hamburger).
 *
 * All motion uses transforms + opacity only — zero layout shift.
 */
export function Navigation() {
  const progress = useScrollStore((s) => s.progress);
  const scrollTop = useScrollStore((s) => s.scrollTop);
  const velocity = useScrollStore((s) => s.velocity);
  const viewport = useScrollStore((s) => s.viewport);
  const activeSceneId = useThreeSceneStore((s) => s.activeSceneId);
  const reduced = useSceneStore((s) => s.reducedMotion);

  // Motion values for scroll-driven visuals.
  const progressMV = useMotionValue(progress);
  const visibleMV = useMotionValue(1);

  // Sync store progress → motion value (store updates are not MotionValues).
  useEffect(() => {
    progressMV.set(progress);
  }, [progress, progressMV]);

  // Hide/reveal based on scroll direction.
  const [hidden, setHidden] = useState(false);
  const lastScrollRef = useRef(0);

  useMotionValueEvent(progressMV, "change", () => {
    const last = lastScrollRef.current;
    const delta = scrollTop - last;
    // Only hide after we've scrolled past ~1 viewport.
    if (scrollTop < 80) {
      setHidden(false);
      lastScrollRef.current = scrollTop;
      return;
    }
    // Velocity sign is the primary signal; delta is a fallback.
    const goingDown = velocity > 50 || delta > 8;
    const goingUp = velocity < -50 || delta < -8;
    if (goingDown && !hidden) setHidden(true);
    else if (goingUp && hidden) setHidden(false);
    lastScrollRef.current = scrollTop;
  });

  // Visible motion value reacts to `hidden`.
  useEffect(() => {
    visibleMV.set(hidden ? 0 : 1);
  }, [hidden, visibleMV]);

  // Height shrinks slightly on scroll.
  const heightMV = useTransform(progressMV, [0, 0.1], [64, 52]);
  const yMV = useTransform(visibleMV, [0, 1], [-80, 0]);

  // Navigate via Lenis smooth scroll.
  const navigate = useCallback((href: string) => {
    const id = href.replace("/#", "");
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(el, { offset: -80, duration: 1.2 });
    } else {
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  }, [reduced]);

  // Keyboard: Tab to nav, arrow keys to cycle items.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const nav = document.querySelector<HTMLElement>('[aria-label="Scene navigation"]');
      if (!nav) return;
      const items = Array.from(nav.querySelectorAll<HTMLButtonElement>("button"));
      const focused = document.activeElement as HTMLButtonElement | null;
      const idx = items.indexOf(focused as HTMLButtonElement);
      if (idx === -1) return;
      e.preventDefault();
      const nextIdx =
        e.key === "ArrowRight"
          ? (idx + 1) % items.length
          : (idx - 1 + items.length) % items.length;
      items[nextIdx]?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showProgress = progress > 0.02;
  const isMobile = viewport.isMobile;

  return (
    <>
      {/* Desktop + tablet: floating capsule */}
      <motion.header
        role="banner"
        style={{ height: heightMV, y: reduced ? 0 : yMV }}
        className={cn(
          "fixed left-1/2 top-4 z-[150] -translate-x-1/2",
          "transition-opacity duration-500",
        )}
      >
        <motion.div
          className={cn(
            "relative flex items-center justify-between gap-4 rounded-full",
            "px-5 sm:px-6",
          )}
          style={{ height: heightMV }}
        >
          <NavigationBackdrop progress={progressMV} visible={visibleMV} />
          <NavigationProgress progress={progressMV} visible={showProgress} />

          <NavigationLogo progress={progressMV} hidden={hidden} />

          <NavigationMenu activeScene={activeSceneId} onNavigate={navigate} />

          <NavigationCTA
            onPrimary={() => navigate("/#marketplace")}
            onSecondary={() => navigate("/#cta")}
            compact={progress > 0.1}
          />
        </motion.div>
      </motion.header>

      {/* Mobile: radial menu (separate fixed element) */}
      {isMobile && (
        <MobileRadialMenu activeScene={activeSceneId} onNavigate={navigate} />
      )}
    </>
  );
}
