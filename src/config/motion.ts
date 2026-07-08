const bez = (
  a: number,
  b: number,
  c: number,
  d: number,
): [number, number, number, number] => [a, b, c, d];

/** Framer Motion cubic-bezier easings. */
export const EASE = {
  settle: bez(0.16, 1, 0.3, 1),
  cinematic: bez(0.7, 0, 0.3, 1),
  precise: bez(0.4, 0, 0.2, 1),
  depart: bez(0.55, 0, 0.45, 1),
} as const;

/** Duration scale (seconds). */
export const DURATION = {
  xs: 0.12,
  sm: 0.24,
  md: 0.48,
  lg: 0.9,
  xl: 1.6,
  hero: 2.4,
} as const;

/** Stagger intervals (seconds). */
export const STAGGER = {
  fast: 0.06,
  default: 0.1,
  slow: 0.14,
} as const;

/** GSAP string easings (mirror the Framer set). */
export const GSAP_EASE = {
  settle: "power4.out",
  cinematic: "expo.inOut",
  precise: "power2.inOut",
  depart: "power3.inOut",
} as const;
