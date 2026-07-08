"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { EASE } from "@/config/motion";
import { cn } from "@/lib/cn";

export interface NavigationProgressProps {
  /** Scroll progress 0→1. */
  progress: MotionValue<number>;
  /** Whether the progress bar is visible (fades in after hero). */
  visible: boolean;
}

/**
 * NavigationProgress — ultra-thin (1px) platinum line along the top edge of
 * the nav capsule. Width scales with scroll progress. Fades in once the user
 * scrolls past the first viewport.
 */
export function NavigationProgress({
  progress,
  visible,
}: NavigationProgressProps) {
  const scaleX = useTransform(progress, [0, 1], [0, 1]);
  const opacity = useTransform(progress, [0, 0.03, 0.08], [0, 0, 1]);

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, opacity: visible ? opacity : 0 }}
      className={cn(
        "absolute inset-x-0 top-0 h-px origin-left bg-platinum",
      )}
      transition={{ ease: EASE.settle, duration: 0.3 }}
    />
  );
}
