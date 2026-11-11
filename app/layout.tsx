import type { Metadata, Viewport } from "next";
import {
  Space_Grotesk,
  Hanken_Grotesk,
  JetBrains_Mono,
  IBM_Plex_Sans_Arabic,
} from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
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
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iury.studio"),
  title: {
    default: "Belkhiri Abdelaziz — Systèmes d'entreprise, module par module",
    template: "%s — Belkhiri Abdelaziz",
  },
  description:
    "Cinq systèmes conçus et construits de bout en bout — contrats et échéanciers, journaux comptables, entrepôts, équipes terrain, portails et messagerie temps réel — démontés module par module.",
  keywords: [
    "Belkhiri Abdelaziz",
    "IURY",
    "ERP",
    "logiciel d'entreprise",
    "ingénieur logiciel",
    "Algérie",
    "multi-entités",
    "comptabilité",
    "Next.js",
  ],
  authors: [{ name: "Belkhiri Abdelaziz" }],
  openGraph: {
    title: "Belkhiri Abdelaziz — Systèmes d'entreprise, module par module",
    description:
      "Contrats, journaux comptables, entrepôts, équipes terrain, portails : cinq systèmes conçus et construits de bout en bout, et comment chacun fonctionne.",
    type: "website",
    siteName: "IURY",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Belkhiri Abdelaziz — Systèmes d'entreprise, module par module",
    description: "Cinq systèmes conçus et construits de bout en bout, démontés module par module.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#e8e8ea",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${grotesk.variable} ${hanken.variable} ${mono.variable} ${arabic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
