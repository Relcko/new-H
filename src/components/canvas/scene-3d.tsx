"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useThreeSceneStore } from "@/lib/three/scene-store";

/**
 * 3D Scene Manager — wraps page-level scene modules so the engine knows which
 * scene is currently the camera owner and which scenes are mounted. Each
 * `<Scene3D id="hero">` declares itself; the most-recently mounted scene
 * claims `activeSceneId`, and downstream subsystems (camera rig,
 * post-processing, particles) read it to gate their work.
 *
 * Pure infrastructure — renders an empty R3F `<group>` and registry plumbing.
 * Pages wrap scene content as children.
 */
export interface Scene3DProps {
  /** Globally unique id (e.g. "hero", "marketplace"). */
  id: string;
  /** Higher numbers hint arbitration order (informational — last mount wins). */
  priority?: number;
  children: ReactNode;
  /** Called when this scene becomes the active claim. */
  onActive?: () => void;
  /** Called when another scene takes the claim. */
  onInactive?: () => void;
}

export function Scene3D({
  id,
  priority = 0,
  children,
  onActive,
  onInactive,
}: Scene3DProps) {
  const activeSceneId = useThreeSceneStore((s) => s.activeSceneId);
  const setActiveScene = useThreeSceneStore((s) => s.setActiveScene);
  const wasActiveRef = useRef(false);

  useEffect(() => {
    setActiveScene(id);
    return () => {
      // Retire only if still ours so we don't clobber a sibling's claim.
      if (useThreeSceneStore.getState().activeSceneId === id) {
        setActiveScene(null);
      }
    };
  }, [id, setActiveScene]);

  const isActive = activeSceneId === id;
  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      wasActiveRef.current = true;
      onActive?.();
    } else if (!isActive && wasActiveRef.current) {
      wasActiveRef.current = false;
      onInactive?.();
    }
  }, [isActive, onActive, onInactive]);

  return (
    <group userData={{ sceneId: id, priority }}>{children}</group>
  );
}