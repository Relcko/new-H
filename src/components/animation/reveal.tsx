"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE, DURATION } from "@/config/motion";
import { useSceneStore } from "@/stores/scene-store";
import { cn } from "@/lib/cn";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
}

/** Generic masked fade-up. Used for sub-copy and supporting hero elements. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  blur = true,
}: RevealProps) {
  const reduced = useSceneStore((s) => s.reducedMotion);

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: reduced ? 0 : y, filter: blur ? "blur(8px)" : "blur(0px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: reduced ? 0 : DURATION.lg,
        ease: EASE.settle,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
