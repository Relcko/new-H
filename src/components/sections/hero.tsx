"use client";

import { SplitText } from "@/components/ui/split-text";
import { Reveal } from "@/components/animation/reveal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { GhostButton } from "@/components/ui/ghost-button";
import { DURATION } from "@/config/motion";

/**
 * ACT I — Arrival (UI overlay).
 * Floats above the 3D city (`<HeroCanvas/>`). The dark radial behind the copy
 * guarantees legibility over the lit skyline; the rest is transparent so the
 * cinematic world reads through.
 *
 * UI is fully independent from the 3D layer — it can render with or without
 * the canvas (reduced-motion path returns null from HeroCanvas; this section
 * still paints with its own ambient gradient).
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6"
    >
      {/* Legibility veil — darkens the city behind the copy only. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 42%, rgba(5,6,8,0.6) 0%, rgba(5,6,8,0.25) 40%, transparent 70%)",
        }}
      />

      <div className="relative flex w-full max-w-[1100px] flex-col items-center text-center">
        <Reveal delay={0.1} y={0} blur={false}>
          <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-mist-300">
            Fractional ownership — on-chain
          </span>
        </Reveal>

        <h1 className="mt-8 font-display text-[clamp(3.2rem,13vw,11rem)] font-normal leading-[0.86] text-platinum-bright opsz-display">
          <span className="block">
            <SplitText text="Own the" delay={0.25} />
          </span>
          <span className="block">
            <SplitText text="extraordinary." delay={0.42} />
          </span>
        </h1>

        <Reveal delay={0.9} className="mt-8 max-w-md">
          <p className="font-sans text-[15px] leading-relaxed text-mist-400">
            Fractional ownership of premium real estate powered by blockchain.
          </p>
        </Reveal>

        <Reveal delay={1.1} y={0} blur={false} className="mt-10">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <MagneticButton type="button">Explore Properties</MagneticButton>
            <GhostButton type="button">Learn More</GhostButton>
          </div>
        </Reveal>
      </div>

      {/* Scroll cue — appears after the cinematic intro completes. */}
      <Reveal
        delay={DURATION.hero}
        y={0}
        blur={false}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist-300">
            Scroll
          </span>
          <span className="relative h-10 w-px overflow-hidden bg-mist-100">
            <span className="absolute inset-x-0 top-0 h-4 origin-top animate-[scrollcue_1.8s_var(--ease-cinematic)_infinite] bg-platinum" />
          </span>
        </div>
      </Reveal>
    </section>
  );
}
