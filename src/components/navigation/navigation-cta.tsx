"use client";

import { MagneticButton } from "@/components/ui/magnetic-button";
import { GhostButton } from "@/components/ui/ghost-button";
import { cn } from "@/lib/cn";

export interface NavigationCTAProps {
  onPrimary: () => void;
  onSecondary: () => void;
  /** Compact mode — reduces padding for the hidden/scrolled state. */
  compact?: boolean;
}

/**
 * NavigationCTA — the two CTA buttons on the right side of the nav. Primary
 * "Explore Properties" uses the magnetic button; secondary "Launch App" is
 * a ghost button placeholder. Both shrink slightly in compact mode.
 */
export function NavigationCTA({
  onPrimary,
  onSecondary,
  compact,
}: NavigationCTAProps) {
  return (
    <div className={cn("flex items-center gap-2 sm:gap-3", compact && "scale-90")}>
      <GhostButton
        type="button"
        onClick={onSecondary}
        className="hidden px-5 py-2.5 text-[9px] sm:inline-flex"
      >
        Launch App
      </GhostButton>
      <MagneticButton
        type="button"
        onClick={onPrimary}
        strength={10}
        className="px-5 py-2.5 text-[9px]"
      >
        Explore
      </MagneticButton>
    </div>
  );
}
