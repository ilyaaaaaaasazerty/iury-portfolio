"use client";

import SmoothScroll from "./smooth-scroll";
import { LocaleProvider } from "./locale-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <SmoothScroll>{children}</SmoothScroll>
    </LocaleProvider>
  );
}
