"use client";

import { motion, type Variants } from "framer-motion";
import { EASE, DURATION, STAGGER } from "@/config/motion";
import { useSceneStore } from "@/stores/scene-store";
import { cn } from "@/lib/cn";

interface SplitTextProps {
  text: string;
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}

/**
 * Word-by-word masked reveal. Each word rises from behind an overflow clip.
 * Accessible: the full string is exposed to assistive tech via a sr-only copy;
 * the visual words are marked aria-hidden.
 */
export function SplitText({
  text,
  className,
  lineClassName,
  delay = 0,
  stagger = STAGGER.slow,
  once = true,
}: SplitTextProps) {
  const reduced = useSceneStore((s) => s.reducedMotion);
  const words = text.split(" ");

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : stagger,
        delayChildren: delay,
      },
    },
  };

  const child: Variants = {
    hidden: { y: "115%" },
    show: {
      y: "0%",
      transition: { duration: reduced ? 0 : DURATION.lg, ease: EASE.settle },
    },
  };

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden
        variants={container}
        initial="hidden"
        animate="show"
        viewport={once ? undefined : { once }}
        className={cn("inline", lineClassName)}
      >
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em]"
          >
            <motion.span className="inline-block" variants={child}>
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </span>
  );
}
