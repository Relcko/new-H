import { create } from "zustand";

type CursorVariant = "default" | "inspect" | "link";

interface UIState {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
  preloaderDone: boolean;
  setPreloaderDone: (done: boolean) => void;
  cursorVariant: CursorVariant;
  setCursorVariant: (v: CursorVariant) => void;
}

export const useUIStore = create<UIState>((set) => ({
  navOpen: false,
  setNavOpen: (navOpen) => set({ navOpen }),
  preloaderDone: false,
  setPreloaderDone: (preloaderDone) => set({ preloaderDone }),
  cursorVariant: "default",
  setCursorVariant: (cursorVariant) => set({ cursorVariant }),
}));
