import { HeroCanvas } from "@/components/sections/hero-canvas";
import { HeroVideo } from "@/components/assets/hero-video";
import { Hero } from "@/components/sections/hero";

export default function Home() {
  return (
    <>
      {/* z-0: procedural 3D city (or reduced-motion poster fallback). */}
      <HeroCanvas />

      {/* z-1: optional cinematic video — renders null when no production
          video exists in /public/assets/videos/. When present, it layers
          above the canvas and below the UI. */}
      <HeroVideo className="z-[1]" />

      {/* z-10: UI overlay — independent from the 3D/video layers. */}
      <Hero />
    </>
  );
}
