"use client";

import { useEffect } from "react";
import { useDevStore } from "@/stores/dev-store";
import { useScrollStore } from "@/stores/scroll-store";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { AssetManager } from "@/lib/asset-manifest";
import { getRegistry } from "@/lib/scroll/registry";
import { useRegistryVersion } from "@/hooks/use-registry-version";

/**
 * EngineStatus — shows readiness flags for every engine subsystem. Polls
 * stores + the asset manager + the scene registry and mirrors into the dev
 * store so other panels can read the flags too.
 */
export function EngineStatus() {
  useRegistryVersion(); // re-render when registry changes

  const setEngineStatus = useDevStore((s) => s.setEngineStatus);
  const engineStatus = useDevStore((s) => s.engineStatus);

  const scrollActive = useScrollStore((s) => s.active);
  const threeReady = useThreeSceneStore((s) => s.ready);
  const activeSceneId = useThreeSceneStore((s) => s.activeSceneId);

  useEffect(() => {
    const registry = getRegistry();
    setEngineStatus({
      scroll: scrollActive,
      three: threeReady,
      assets: AssetManager.isLoaded,
      renderer: threeReady,
      registry: registry.getVersion() > 0,
      camera: activeSceneId !== null,
    });
  }, [scrollActive, threeReady, activeSceneId, setEngineStatus]);

  const rows = [
    { label: "Scroll Engine", value: engineStatus.scroll },
    { label: "Three Engine", value: engineStatus.three },
    { label: "Asset System", value: engineStatus.assets },
    { label: "Renderer", value: engineStatus.renderer },
    { label: "Scene Registry", value: engineStatus.registry },
    { label: "Camera", value: engineStatus.camera },
  ];

  return (
    <div
      className="fixed bottom-4 left-4 z-[9999] rounded-lg border border-white/10 bg-ink-900/90 px-3 py-2 font-mono text-[9px] backdrop-blur-xl"
      aria-hidden
    >
      <div className="mb-1 uppercase tracking-[0.2em] text-mist-300">
        Engine Status
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-1.5">
            <span
              className={
                row.value
                  ? "h-1.5 w-1.5 rounded-full bg-signal"
                  : "h-1.5 w-1.5 rounded-full bg-ember"
              }
            />
            <span className={row.value ? "text-mist-400" : "text-mist-300"}>
              {row.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
