import type gsap from "gsap";

/** GSAP timeline type alias. */
export type Timeline = gsap.core.Timeline;
/** GSAP animation context type alias. */
export type GsapContext = gsap.Context;

/** A registered scene's lifecycle contract. No page content here. */
export interface SceneDefinition<T extends Timeline = Timeline> {
  /** Stable id matching a section's DOM id (e.g. "hero", "problem"). */
  id: string;
  /** Optional priority for camera-claim arbitration (higher wins). */
  priority?: number;
  /**
   * Build a scene's GSAP timeline, scoped to the given context. Return the
   * timeline so the registry can attach ScrollTriggers and dispose cleanly.
   * Implementation MUST create all ScrollTriggers within the provided context
   * (useScope(remoteContext)).
   */
  build: (ctx: GsapContext, self: SceneHandle) => T | void;
}

/** Handle handed to a scene's build() so it can introspect engine state. */
export interface SceneHandle {
  id: string;
  /** Root element ref the scene is mounted on, if provided. */
  el: HTMLElement | null;
  reducedMotion: boolean;
  canvasTier: "desktop" | "mobile" | "weak";
  paused: boolean;
}

/** Result of registering a scene; used to tear it down. */
export interface SceneRegistration {
  id: string;
  context: GsapContext;
  timeline?: Timeline;
}

/** Viewport metrics recomputed on resize. */
export interface Viewport {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  dpr: number;
}

export const SCENE_IDS = [
  "hero",
  "problem",
  "solution",
  "tokenization",
  "marketplace",
  "roadmap",
  "cta",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];