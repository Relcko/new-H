"use client";

import { motion } from "framer-motion";
import { EASE, DURATION } from "@/config/motion";
import { cn } from "@/lib/cn";
import type { NavItem } from "@/config/site";

export interface NavigationItemProps {
  item: NavItem;
  active: boolean;
  onClick: (href: string) => void;
}

/**
 * NavigationItem — single desktop nav link. Shows an underline that draws in
 * when the item is the active scene. Text brightens from mist to platinum on
 * hover/active. Uses transforms + color transitions only.
 */
export function NavigationItem({
  item,
  active,
  onClick,
}: NavigationItemProps) {
  return (
    <motion.button
      onClick={() => onClick(item.href)}
      data-scene={item.scene}
      aria-current={active ? "true" : undefined}
      className={cn(
        "relative rounded-full px-4 py-1.5",
        "font-mono text-[10px] uppercase tracking-[0.25em]",
        "transition-colors duration-500 ease-settle",
        active
          ? "text-platinum-bright"
          : "text-mist-400 hover:text-mist-500",
        "focus-visible:outline-1 focus-visible:outline-offset-2",
      )}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: DURATION.xs, ease: EASE.precise }}
    >
      <span className="relative z-10">{item.label}</span>

      {/* Active underline — draws from left. */}
      <motion.span
        aria-hidden
        className="absolute inset-x-3 bottom-0.5 h-px origin-left bg-platinum"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: DURATION.sm, ease: EASE.settle }}
      />
    </motion.button>
  );
}
