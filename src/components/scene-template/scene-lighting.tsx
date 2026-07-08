"use client";

import {
  KeyLight,
  FillLight,
  RimLight,
  AccentLight,
  AmbientPass,
} from "@/components/lights";
import type { SceneLightConfig } from "./types";

/**
 * SceneLighting — renders the four-point cinematic rig (key/fill/rim/accent)
 * plus an ambient pass from a resolved `SceneLightConfig`. Each light is
 * optional; omitting its key skips that light entirely.
 *
 * Pure composition over the engine light primitives — no lighting tuning lives
 * here beyond forwarding the consumer's overrides.
 */
export interface SceneLightingProps {
  config: SceneLightConfig;
}

export function SceneLighting({ config }: SceneLightingProps) {
  return (
    <>
      {config.key && <KeyLight {...config.key} />}
      {config.fill && <FillLight {...config.fill} />}
      {config.rim && <RimLight {...config.rim} />}
      {config.accent && <AccentLight {...config.accent} />}
      {config.ambient && <AmbientPass {...config.ambient} />}
    </>
  );
}
