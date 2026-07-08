"use client";

import { useThreeSceneStore } from "@/lib/three/scene-store";
import type { QualityTier } from "@/lib/three/quality";
import { DevPanel } from "./dev-panel";
import { useDevStore } from "@/stores/dev-store";

const TIERS: QualityTier[] = ["ultra", "high", "medium", "low", "weak"];

/**
 * PerformanceInspector — shows the current quality preset's full details and
 * allows live switching between tiers. Changes go through the engine store,
 * so every subsystem (renderer, particles, post-FX, shadows) adapts instantly.
 */
export function PerformanceInspector() {
  const open = useDevStore((s) => s.panels.performance);
  const quality = useThreeSceneStore((s) => s.quality);
  const preset = useThreeSceneStore((s) => s.preset);
  const setQuality = useThreeSceneStore((s) => s.setQuality);

  return (
    <DevPanel
      open={open}
      title="Performance"
      shortcut="F2"
      items={[
        { label: "Preset", value: preset.tier.toUpperCase() },
        { label: "DPR Range", value: `${preset.dpr[0]}–${preset.dpr[1]}` },
        {
          label: "Particle Mult.",
          value: `${(preset.particleScale * 100).toFixed(0)}%`,
        },
        {
          label: "Shadow Quality",
          value: preset.shadowMapSize > 0 ? `${preset.shadowMapSize}px` : "off",
        },
        {
          label: "Env Resolution",
          value: `${preset.envResolution}px`,
        },
        { label: "Bloom", value: preset.bloom.enabled ? "on" : "off" },
        {
          label: "Bloom Intensity",
          value: preset.bloom.enabled ? preset.bloom.intensity.toFixed(2) : "—",
        },
        { label: "DOF", value: preset.dof.enabled ? "on" : "off" },
        { label: "AO", value: preset.ao.enabled ? "on" : "off" },
        {
          label: "Chromatic Aberr.",
          value: preset.chromaticAberration.enabled ? "on" : "off",
        },
        { label: "Noise", value: preset.noise.enabled ? "on" : "off" },
        { label: "Vignette", value: preset.vignette.enabled ? "on" : "off" },
        { label: "Antialias", value: preset.antialias ? "on" : "off" },
        { label: "Exposure", value: preset.exposure.toFixed(2) },
      ]}
    >
      <div className="mt-2 border-t border-white/5 pt-2">
        <div className="mb-1 uppercase tracking-[0.2em] text-mist-300">
          Live Switch
        </div>
        <div className="flex flex-wrap gap-1">
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => setQuality(tier)}
              className={
                tier === quality
                  ? "rounded bg-platinum px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-ink-950"
                  : "rounded border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-mist-400 transition-colors hover:bg-white/10"
              }
            >
              {tier}
            </button>
          ))}
        </div>
      </div>
    </DevPanel>
  );
}
