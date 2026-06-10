"use client";

import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n";

export default function SectionHeader({
  num,
  labelKey,
}: {
  num: number;
  labelKey: string;
}) {
  const { locale } = useLocale();
  return (
    <div className="mb-12 flex items-center gap-4">
      <span className="meta whitespace-nowrap text-ash">
        {t(locale, "common.exposure")} {String(num).padStart(2, "0")} —{" "}
        {t(locale, labelKey)}
      </span>
      <span className="h-px flex-1 bg-line" />
      <span className="hidden meta text-ash/60 sm:inline">IURY</span>
    </div>
  );
}
