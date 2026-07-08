import { create } from "zustand";

type CanvasTier = "desktop" | "mobile" | "weak";

interface SceneState {
  activeSection: string;
  setActiveSection: (id: string) => void;
  scrollProgress: number;
  setScrollProgress: (p: number) => void;
  scrollVelocity: number;
  setScrollVelocity: (v: number) => void;
  reducedMotion: boolean;
  setReducedMotion: (r: boolean) => void;
  canvasTier: CanvasTier;
  setCanvasTier: (t: CanvasTier) => void;
  paused: boolean;
  setPaused: (p: boolean) => void;
}

export const useSceneStore = create<SceneState>((set) => ({
  activeSection: "hero",
  setActiveSection: (activeSection) => set({ activeSection }),
  scrollProgress: 0,
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  scrollVelocity: 0,
  setScrollVelocity: (scrollVelocity) => set({ scrollVelocity }),
  reducedMotion: false,
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  canvasTier: "desktop",
  setCanvasTier: (canvasTier) => set({ canvasTier }),
  paused: false,
  setPaused: (paused) => set({ paused }),
}));
