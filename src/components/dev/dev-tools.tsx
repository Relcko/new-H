"use client";

import { useEffect } from "react";
import { useDevStore } from "@/stores/dev-store";
import { DevFPSMonitor } from "./dev-fps-monitor";
import { EngineStatus } from "./engine-status";
import { DebugPanel } from "./debug-panel";
import { PerformanceInspector } from "./performance-inspector";
import { CameraInspector } from "./camera-inspector";
import { SceneInspector } from "./scene-inspector";

/**
 * DevTools — root of the dev-only DX toolkit. Renders all inspector panels
 * + the FPS monitor + the engine status widget. Listens for F1–F4 keyboard
 * shortcuts to toggle each panel.
 *
 * This module is the single entry point for the dev toolkit. It is imported
 * dynamically by the Providers component, gated on
 * `process.env.NODE_ENV !== 'production'` — so the entire dev module tree
 * (this file + all imports) is tree-shaken out of production builds.
 */
export function DevTools() {
  const panels = useDevStore((s) => s.panels);
  const togglePanel = useDevStore((s) => s.togglePanel);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore when typing in inputs.
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case "F1":
          e.preventDefault();
          togglePanel("debug");
          break;
        case "F2":
          e.preventDefault();
          togglePanel("performance");
          break;
        case "F3":
          e.preventDefault();
          togglePanel("camera");
          break;
        case "F4":
          e.preventDefault();
          togglePanel("scene");
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePanel]);

  const anyOpen =
    panels.debug || panels.performance || panels.camera || panels.scene;

  return (
    <>
      <DevFPSMonitor />
      <EngineStatus />
      <DebugPanel />
      <PerformanceInspector />
      <CameraInspector />
      <SceneInspector />

      {/* Shortcut hint — shows when no panel is open. */}
      {!anyOpen && (
        <div
          className="fixed bottom-4 right-4 z-[9999] rounded-lg border border-white/10 bg-ink-900/80 px-3 py-2 font-mono text-[8px] text-mist-300 backdrop-blur-xl"
          aria-hidden
        >
          <span className="text-platinum">F1</span> Debug ·{" "}
          <span className="text-platinum">F2</span> Perf ·{" "}
          <span className="text-platinum">F3</span> Camera ·{" "}
          <span className="text-platinum">F4</span> Scene
        </div>
      )}
    </>
  );
}
