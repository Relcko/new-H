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

interface MagneticButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref" | "children"> {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Magnetic call-to-action. The element is pulled toward the pointer while
 * hovered and springs back to origin on leave. A platinum fill wipes in from
 * the leading edge on hover, flipping the label to ink. Disabled entirely
 * under prefers-reduced-motion.
 */
export function MagneticButton({
  children,
  strength = 16,
  className,
  ...props
}: MagneticButtonProps) {
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
        "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full",
        "border border-platinum/25 bg-white/[0.02] px-8 py-4 backdrop-blur-xl",
        "font-mono text-[11px] uppercase tracking-[0.3em] text-platinum-bright",
        "transition-colors duration-500 ease-settle hover:border-platinum/70",
        "focus-visible:outline-1 focus-visible:outline-offset-4",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-platinum transition-transform duration-500 ease-settle group-hover:scale-x-100"
      />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-ink-950">
        {children}
      </span>
    </motion.button>
  );
}
