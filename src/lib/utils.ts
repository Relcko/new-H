export const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), max);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mapRange = (
  v: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  const t = clamp((v - inMin) / (inMax - inMin), 0, 1);
  return lerp(outMin, outMax, t);
};

/** Frame-rate-independent damping. */
export const damp = (a: number, b: number, lambda: number, dt: number) =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

export const formatCurrency = (n: number, currency = "USD", maxFraction = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: maxFraction,
  }).format(n);

export const formatNumber = (n: number, fraction = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: fraction }).format(n);

export const formatCompact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export const formatPercent = (n: number, fraction = 1) =>
  new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: fraction,
  }).format(n);
