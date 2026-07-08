"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

export interface NavigationLogoProps {
  /** Scroll progress 0→1 — drives logo scale. */
  progress: MotionValue<number>;
  /** Compact mode (hidden nav) — logo shrinks further. */
  hidden: boolean;
}

/**
 * NavigationLogo — wordmark. Scales down subtly as the user scrolls past the
 * hero so the nav feels "tighter" when content is dense. Uses transforms only
 * — zero layout shift. Opacity drops slightly when the nav is hidden.
 */
export function NavigationLogo({ progress, hidden }: NavigationLogoProps) {
  const scale = useTransform(progress, [0, 0.1], [1, 0.88]);
  const scrollOpacity = useTransform(progress, [0, 0.05], [1, 0.85]);

  return (
    <motion.a
      href="/#hero"
      aria-label={`${site.name} — home`}
      style={{ scale, opacity: hidden ? 0.6 : scrollOpacity }}
      className={cn(
        "font-display text-lg tracking-[0.06em] text-platinum-bright",
        "transition-colors duration-500 hover:text-platinum",
        "focus-visible:outline-1 focus-visible:outline-offset-4 rounded-sm",
      )}
    >
      {site.name}
    </motion.a>
  );
}
