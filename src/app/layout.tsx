import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://relcko.com"),
  title: {
    default: "RELCKO — Tokenized Real Estate Ownership",
    template: "%s — RELCKO",
  },
  description:
    "Relcko is a blockchain-powered real estate tokenization platform enabling fractional ownership of premium assets. Liquidity, transparency, and trust — on-chain.",
  keywords: [
    "real estate tokenization",
    "fractional ownership",
    "blockchain real estate",
    "RELCKO",
    "tokenized property",
    "real estate investing",
  ],
  authors: [{ name: "RELCKO" }],
  openGraph: {
    type: "website",
    title: "RELCKO — Tokenized Real Estate Ownership",
    description:
      "Blockchain-powered real estate tokenization. Fractional ownership of premium assets — liquid, transparent, governed.",
    siteName: "RELCKO",
  },
  twitter: {
    card: "summary_large_image",
    title: "RELCKO — Tokenized Real Estate Ownership",
    description:
      "Blockchain-powered real estate tokenization. Fractional ownership of premium assets.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050608",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
