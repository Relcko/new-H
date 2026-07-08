"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Canvas context — provides the *engine* a 3D subtree runs under. Used by
 * scene modules and post-processing to know whether they're inside a canvas
 * owned by the root provider. (R3F's intrinsic context is still the source of
 * truth for the actual `gl`/`scene`/`camera`; this is engine plumbing.)
 */
interface CanvasContextValue {
  /** Stable id of the canvas instance (we only run one, but plumbed). */
  canvasId: string;
  ready: boolean;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({
  children,
  canvasId,
  ready,
}: {
  children: ReactNode;
  canvasId: string;
  ready: boolean;
}) {
  return (
    <CanvasContext.Provider value={{ canvasId, ready }}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasContext(): CanvasContextValue | null {
  return useContext(CanvasContext);
}