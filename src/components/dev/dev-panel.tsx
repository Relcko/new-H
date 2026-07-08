"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DevPanelProps {
  open: boolean;
  title: string;
  shortcut: string;
  items: Array<{ label: string; value: string }>;
  children?: ReactNode;
}

/**
 * DevPanel — shared shell for all dev inspector panels. Fixed-position,
 * monospaced, dark frosted glass, collapsible. Never rendered in production
 * (parent modules are dev-gated).
 */
export function DevPanel({ open, title, shortcut, items, children }: DevPanelProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed z-[9999] max-h-[60vh] w-[320px] overflow-y-auto rounded-lg",
        "border border-white/10 bg-ink-900/95 backdrop-blur-xl",
        "font-mono text-[10px] leading-relaxed text-mist-400",
        "shadow-2xl shadow-black/50",
      )}
      style={{ top: "60px", right: "16px" }}
    >
      <div className="sticky top-0 flex items-center justify-between border-b border-white/5 bg-ink-900/95 px-3 py-2">
        <span className="uppercase tracking-[0.2em] text-platinum-bright">
          {title}
        </span>
        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[8px] text-mist-300">
          {shortcut}
        </span>
      </div>
      <div className="px-3 py-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 py-0.5"
          >
            <span className="text-mist-300">{item.label}</span>
            <span className="truncate text-right text-platinum-bright">
              {item.value}
            </span>
          </div>
        ))}
        {children}
      </div>
    </div>
  );
}
