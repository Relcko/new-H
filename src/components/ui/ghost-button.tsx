"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from "framer-motion";
import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import { useSceneStore } from "@/stores/scene-store";

interface GhostButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Secondary CTA — same magnetic pull as <MagneticButton> but with an outlined
 * ghost treatment: no fill wipe, text stays platinum on hover, border
 * brightens. Used for the "Learn More" companion to the primary CTA.
 *
 * Reduced-motion: magnetic effect disabled, button remains fully functional.
 */
export function GhostButton({
  children,
  strength = 12,
  className,
  ...props
}: GhostButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduced = useSceneStore((s) => s.reducedMotion);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  function onMouseMove(e: MouseEvent<HTMLButtonElement>) {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const relX = e.clientX - (r.left + r.width / 2);
    const relY = e.clientY - (r.top + r.height / 2);
    x.set((relX / (r.width / 2)) * strength);
    y.set((relY / (r.height / 2)) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      data-magnetic
      onMouseMove={onMouseMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={cn(
        "group relative inline-flex items-center justify-center gap-3 rounded-full",
        "border border-mist-200/40 bg-transparent px-8 py-4",
        "font-mono text-[11px] uppercase tracking-[0.3em] text-mist-400",
        "transition-colors duration-500 ease-settle hover:border-mist-400/60 hover:text-mist-500",
        "focus-visible:outline-1 focus-visible:outline-offset-4",
        className,
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
