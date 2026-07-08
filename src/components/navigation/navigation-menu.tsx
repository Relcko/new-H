"use client";

import { NavigationItem } from "./navigation-item";
import { site, type NavItem } from "@/config/site";

export interface NavigationMenuProps {
  activeScene: string | null;
  onNavigate: (href: string) => void;
}

/**
 * NavigationMenu — the horizontal list of scene links. Hidden on mobile
 * (the MobileRadialMenu handles navigation there). Reads the active scene
 * from the engine store (passed via prop) to highlight the current section.
 */
export function NavigationMenu({ activeScene, onNavigate }: NavigationMenuProps) {
  return (
    <nav
      aria-label="Scene navigation"
      className="hidden items-center gap-0.5 md:flex"
    >
      {site.nav.map((item: NavItem) => (
        <NavigationItem
          key={item.scene}
          item={item}
          active={activeScene === item.scene}
          onClick={onNavigate}
        />
      ))}
    </nav>
  );
}
