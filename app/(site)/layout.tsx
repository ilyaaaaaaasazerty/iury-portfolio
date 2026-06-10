import Providers from "@/components/providers";
import Overlays from "@/components/overlays";
import Cursor from "@/components/cursor";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Overlays />
      <Cursor />
      {children}
    </Providers>
  );
}
