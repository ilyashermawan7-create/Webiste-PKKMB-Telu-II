import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/layout/providers";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

// Fallback font resmi: "TelU Typeface" dipakai bila terpasang (lihat --font-heading di globals.css)
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "PKKMB Telkom University", template: "%s · PKKMB Telkom University" },
  description: "Website resmi Pengenalan Kehidupan Kampus bagi Mahasiswa Baru (PKKMB) Telkom University — jadwal, atribut, peta kampus, dan dashboard Young TeluTizen.",
  applicationName: "PKKMB Tel-U",
  keywords: ["PKKMB", "Telkom University", "Tel-U", "mahasiswa baru", "Young TeluTizen", "ospek"],
  openGraph: { type: "website", locale: "id_ID", siteName: "PKKMB Telkom University", images: ["/opengraph-image"] },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "PKKMB Tel-U", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#ffffff" }, { media: "(prefers-color-scheme: dark)", color: "#0e0e11" }],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations("a11y");
  return (
    <html lang={locale} suppressHydrationWarning className={`${jakarta.variable} ${inter.variable}`}>
      <body className="min-h-dvh antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-telu-maroon focus:px-4 focus:py-2 focus:text-white">
          {t("skip")}
        </a>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
