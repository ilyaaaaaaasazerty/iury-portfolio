import Providers from "@/components/providers";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
