import { create } from "zustand";

/**
 * Dev-only Zustand store. Holds state that only the DX toolkit reads/writes.
 * This store is imported exclusively by `src/components/dev/*` modules, which
 * are themselves gated behind `process.env.NODE_ENV !== 'production'` — so
 * the entire store is tree-shaken out of production builds.
 */

export interface CameraTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  fov: number;
}

export interface SceneEvent {
  id: string;
  type: "mount" | "unmount" | "active" | "inactive";
  t: number;
}

interface DevState {
  // FPS monitor
  fps: number;
  frameTime: number;
  setFps: (fps: number, frameTime: number) => void;

  // Camera bridge (written by DevCameraBridge inside the canvas)
  cameraTransform: CameraTransform | null;
  setCameraTransform: (t: CameraTransform) => void;

  // Engine status flags
  engineStatus: {
    scroll: boolean;
    three: boolean;
    assets: boolean;
    renderer: boolean;
    registry: boolean;
    camera: boolean;
  };
  setEngineStatus: (next: Partial<DevState["engineStatus"]>) => void;

  // Scene event log (capped)
  sceneEvents: SceneEvent[];
  logSceneEvent: (e: Omit<SceneEvent, "t">) => void;

  // Panel visibility (keyboard shortcuts)
  panels: {
    debug: boolean;
    performance: boolean;
    camera: boolean;
    scene: boolean;
  };
  togglePanel: (key: keyof DevState["panels"]) => void;
  setPanel: (key: keyof DevState["panels"], open: boolean) => void;
}

const MAX_EVENTS = 30;

export const useDevStore = create<DevState>((set) => ({
  fps: 0,
  frameTime: 0,
  setFps: (fps, frameTime) => set({ fps, frameTime }),

  cameraTransform: null,
  setCameraTransform: (cameraTransform) => set({ cameraTransform }),

  engineStatus: {
    scroll: false,
    three: false,
    assets: false,
    renderer: false,
    registry: false,
    camera: false,
  },
  setEngineStatus: (next) =>
    set((s) => ({ engineStatus: { ...s.engineStatus, ...next } })),

  sceneEvents: [],
  logSceneEvent: (e) =>
    set((s) => ({
      sceneEvents: [
        { ...e, t: performance.now() },
        ...s.sceneEvents,
      ].slice(0, MAX_EVENTS),
    })),

  panels: {
    debug: false,
    performance: false,
    camera: false,
    scene: false,
  },
  togglePanel: (key) =>
    set((s) => ({ panels: { ...s.panels, [key]: !s.panels[key] } })),
  setPanel: (key, open) =>
    set((s) => ({ panels: { ...s.panels, [key]: open } })),
}));
