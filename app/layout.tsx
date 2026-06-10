import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Hanken_Grotesk,
  JetBrains_Mono,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ar",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iury.studio"),
  title: {
    default: "IURY — Belkhiri Abdelaziz · Autoentrepreneur & AI Researcher",
    template: "%s — IURY",
  },
  description:
    "The cinematic portfolio of Belkhiri Abdelaziz — autoentrepreneur and AI researcher building software that sees, decides, and ships. AI systems, real-time platforms, and interfaces that move like film.",
  keywords: [
    "Belkhiri Abdelaziz",
    "IURY",
    "AI researcher",
    "autoentrepreneur",
    "software engineer",
    "Algeria",
    "Next.js",
    "full-stack",
  ],
  authors: [{ name: "Belkhiri Abdelaziz" }],
  openGraph: {
    title: "IURY — Belkhiri Abdelaziz",
    description:
      "Autoentrepreneur and AI researcher. A cinematic portfolio of AI systems, real-time platforms, and interfaces that move like film.",
    type: "website",
    siteName: "IURY",
  },
  twitter: {
    card: "summary_large_image",
    title: "IURY — Belkhiri Abdelaziz",
    description: "Autoentrepreneur & AI researcher — cinematic portfolio.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${serif.variable} ${hanken.variable} ${mono.variable} ${arabic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
