import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { fallbackSettings } from "@/lib/fallback";
import { publicApi } from "@/lib/api-server";
import type { PublicSettings } from "@/lib/types";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await publicApi<PublicSettings>("/settings", fallbackSettings);
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">{children}</main>
      <Footer settings={{ ...fallbackSettings, ...settings }} />
    </>
  );
}
