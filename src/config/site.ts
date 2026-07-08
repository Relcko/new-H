export interface NavItem {
  label: string;
  /** Scene id — matches the 3D scene registry + DOM section id. */
  scene: string;
  href: string;
}

export const site = {
  name: "RELCKO",
  tagline: "Tokenized real estate ownership.",
  description:
    "A blockchain-powered real estate tokenization platform enabling fractional ownership of premium assets.",
  url: "https://relcko.com",
  nav: [
    { label: "Hero", scene: "hero", href: "/#hero" },
    { label: "Problem", scene: "problem", href: "/#problem" },
    { label: "Solution", scene: "solution", href: "/#solution" },
    { label: "Tokenization", scene: "tokenization", href: "/#tokenization" },
    { label: "Marketplace", scene: "marketplace", href: "/#marketplace" },
    { label: "Roadmap", scene: "roadmap", href: "/#roadmap" },
    { label: "Contact", scene: "cta", href: "/#cta" },
  ] as NavItem[],
} as const;
