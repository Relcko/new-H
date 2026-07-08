"use client";

import { useEffect, useRef } from "react";
import { useDevStore } from "@/stores/dev-store";
import { useThreeSceneStore } from "@/lib/three/scene-store";
import { getRegistry } from "@/lib/scroll/registry";
import { useRegistryVersion } from "@/hooks/use-registry-version";
import { DevPanel } from "./dev-panel";

/**
 * SceneInspector — shows registered/mounted/active scenes and a rolling log
 * of scene lifecycle events (mount/unmount/active/inactive).
 */
export function SceneInspector() {
  const open = useDevStore((s) => s.panels.scene);
  const activeSceneId = useThreeSceneStore((s) => s.activeSceneId);
  const events = useDevStore((s) => s.sceneEvents);
  const logSceneEvent = useDevStore((s) => s.logSceneEvent);
  const prevActiveRef = useRef<string | null>(null);
  useRegistryVersion(); // re-render when registry changes

  const registry = getRegistry();
  const mountedIds: string[] = [];
  const pendingIds: string[] = [];

  for (const id of [
    "hero",
    "problem",
    "solution",
    "tokenization",
    "marketplace",
    "roadmap",
    "cta",
  ]) {
    if (registry.isMounted(id)) mountedIds.push(id);
    if (registry.hasPending(id)) pendingIds.push(id);
  }

  // Log active-scene transitions.
  useEffect(() => {
    const prev = prevActiveRef.current;
    if (activeSceneId !== prev) {
      if (activeSceneId) logSceneEvent({ id: activeSceneId, type: "active" });
      if (prev) logSceneEvent({ id: prev, type: "inactive" });
      prevActiveRef.current = activeSceneId;
    }
  }, [activeSceneId, logSceneEvent]);

  return (
    <DevPanel
      open={open}
      title="Scene Inspector"
      shortcut="F4"
      items={[
        { label: "Active Scene", value: activeSceneId ?? "—" },
        { label: "Mounted", value: mountedIds.length ? mountedIds.join(", ") : "—" },
        { label: "Pending", value: pendingIds.length ? pendingIds.join(", ") : "—" },
        { label: "Registry Version", value: `${registry.getVersion()}` },
      ]}
    >
      <div className="mt-2 border-t border-white/5 pt-2">
        <div className="mb-1 uppercase tracking-[0.2em] text-mist-300">
          Events
        </div>
        {events.length === 0 ? (
          <div className="text-mist-300">No events yet.</div>
        ) : (
          <div className="space-y-0.5">
            {events.map((e, i) => (
              <div key={i} className="flex justify-between gap-2">
                <span
                  className={
                    e.type === "active"
                      ? "text-signal"
                      : e.type === "inactive"
                        ? "text-mist-300"
                        : "text-platinum"
                  }
                >
                  {e.type}
                </span>
                <span className="text-mist-300">{e.id}</span>
                <span className="text-mist-300">
                  {new Date(e.t).toISOString().slice(11, 19)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DevPanel>
  );
}
