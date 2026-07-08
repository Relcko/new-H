"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { site, type NavItem } from "@/config/site";
import { EASE, DURATION } from "@/config/motion";
import { useSceneStore } from "@/stores/scene-store";
import { cn } from "@/lib/cn";

export interface MobileRadialMenuProps {
  activeScene: string | null;
  onNavigate: (href: string) => void;
}

/**
 * MobileRadialMenu — floating circular button that expands into a radial glass
 * menu. Not a hamburger. The button sits at the bottom-right; tapping it
 * fans out nav items in an arc with spring stagger. Each item is a glass pill
 * that brightens when active.
 *
 * Keyboard accessible:
 *   - Button is a <button> with aria-expanded + aria-controls.
 *   - Items are <button> elements in the DOM order (tabbable when open).
 *   - ESC closes; focus returns to the trigger.
 *   - Focus trap is implicit (only the menu items are interactive when open).
 *
 * Reduced-motion: spring is replaced with instant snap; the arc still expands
 * so the menu is usable, just without the cinematic bloom.
 */
export function MobileRadialMenu({
  activeScene,
  onNavigate,
}: MobileRadialMenuProps) {
  const [open, setOpen] = useState(false);
  const reduced = useSceneStore((s) => s.reducedMotion);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // ESC closes; focus returns to trigger.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function handleNavigate(href: string) {
    onNavigate(href);
    setOpen(false);
    triggerRef.current?.focus();
  }

  // Radial layout — items fan out in an arc from the trigger.
  // Arc spans from 180° (left) to 300° (upper-left) measured clockwise from 3 o'clock.
  const itemCount = site.nav.length;
  const arcStart = 160; // degrees
  const arcEnd = 340; // degrees
  const radius = 120; // px from trigger center

  return (
    <div className="fixed bottom-6 right-6 z-[200] md:hidden">
      {/* Radial items */}
      <AnimatePresence>
        {open && (
          <div className="absolute inset-0">
            {site.nav.map((item: NavItem, i: number) => {
              const t = itemCount > 1 ? i / (itemCount - 1) : 0;
              const angle = (arcStart + (arcEnd - arcStart) * t) * (Math.PI / 180);
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              const isActive = activeScene === item.scene;

              return (
                <motion.button
                  key={item.scene}
                  onClick={() => handleNavigate(item.href)}
                  initial={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, x: 0, y: 0, scale: 0.4 }
                  }
                  animate={
                    reduced
                      ? { opacity: 1, x, y, scale: 1 }
                      : { opacity: 1, x, y, scale: 1 }
                  }
                  exit={
                    reduced
                      ? { opacity: 0 }
                      : { opacity: 0, x: 0, y: 0, scale: 0.4 }
                  }
                  transition={{
                    duration: reduced ? 0 : DURATION.md,
                    ease: EASE.settle,
                    delay: reduced ? 0 : i * 0.04,
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "absolute left-1/2 top-1/2 -ml-16 -mt-5",
                    "flex items-center justify-center rounded-full",
                    "border border-white/10 bg-ink-800/90 px-4 py-2.5",
                    "font-mono text-[9px] uppercase tracking-[0.2em] whitespace-nowrap",
                    "backdrop-blur-xl shadow-lg shadow-black/30",
                    "transition-colors duration-300",
                    isActive
                      ? "text-platinum-bright border-platinum/30"
                      : "text-mist-400 hover:text-mist-500",
                    "focus-visible:outline-1 focus-visible:outline-offset-2",
                  )}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-controls="radial-menu"
        whileTap={{ scale: 0.92 }}
        transition={{ duration: DURATION.xs, ease: EASE.precise }}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full",
          "border border-white/10 bg-ink-800/80 backdrop-blur-xl",
          "shadow-lg shadow-black/40",
          "focus-visible:outline-1 focus-visible:outline-offset-2",
        )}
      >
        {/* Plus / cross icon that rotates on toggle */}
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: DURATION.sm, ease: EASE.settle }}
          className="relative h-4 w-4"
        >
          <span
            className={cn(
              "absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-platinum-bright",
              "transition-colors duration-300",
            )}
          />
          <span
            className={cn(
              "absolute left-1/2 top-1/2 h-4 w-px -translate-x-1/2 -translate-y-1/2 bg-platinum-bright",
              "transition-colors duration-300",
            )}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}
