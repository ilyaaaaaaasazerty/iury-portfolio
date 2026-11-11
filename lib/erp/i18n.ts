"use client";

import { useCallback } from "react";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/types";

/** A piece of copy in the three site languages. `en` is required; the others fall back to it. */
export type L = { en: string; fr?: string; ar?: string };
export type Tx = L | string;

export function tr(t: Tx | undefined, locale: Locale): string {
  if (t === undefined) return "";
  if (typeof t === "string") return t;
  return t[locale] || t.en;
}

/** `const tx = useTx(); tx({ en: "…", fr: "…" })` */
export function useTx() {
  const { locale } = useLocale();
  return useCallback((t: Tx | undefined) => tr(t, locale), [locale]);
}

const NUMBER_LOCALE: Record<Locale, string> = { en: "en-US", fr: "fr-FR", ar: "ar-DZ" };

export function formatNumber(n: number, locale: Locale, digits = 0): string {
  return new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
    numberingSystem: "latn",
  }).format(n);
}

export function useNumber() {
  const { locale } = useLocale();
  return useCallback((n: number, digits = 0) => formatNumber(n, locale, digits), [locale]);
}
