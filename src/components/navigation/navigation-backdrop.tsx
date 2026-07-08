"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";

export interface NavigationBackdropProps {
  /** Scroll progress 0→1. */
  progress: MotionValue<number>;
  /** Whether the nav is visible (not hidden from scroll-down). */
  visible: MotionValue<number>;
}

/**
 * NavigationBackdrop — the frosted-glass capsule behind the nav. Blur + bg
 * opacity ramp up as the user scrolls past the hero; border + shadow stay
 * hairline-thin. Pure visual layer — pointer events pass through to the nav
 * items above it.
 *
 * Uses Framer Motion template-style MotionValues for the composite CSS strings
 * (backdropFilter / backgroundColor / borderColor) so they interpolate without
 * calling .get() during render.
 */
export function NavigationBackdrop({
  progress,
  visible,
}: NavigationBackdropProps) {
  const blurPx = useTransform(progress, [0, 0.05, 0.15], [4, 12, 24]);
  const bgAlpha = useTransform(progress, [0, 0.05, 0.15], [0, 0.03, 0.06]);
  const borderAlpha = useTransform(progress, [0, 0.05, 0.15], [0, 0.04, 0.08]);

  const backdropFilter = useTransform(
    blurPx,
    (v) => `blur(${v}px) saturate(140%)`,
  );
  const backgroundColor = useTransform(
    bgAlpha,
    (v) => `rgba(255,255,255,${v})`,
  );
  const borderColor = useTransform(
    borderAlpha,
    (v) => `rgba(255,255,255,${v})`,
  );

  return (
    <motion.div
      aria-hidden
      style={{
        backdropFilter,
        backgroundColor,
        borderColor,
        opacity: visible,
      }}
      className="pointer-events-none absolute inset-0 rounded-full border shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
    />
  );
}
