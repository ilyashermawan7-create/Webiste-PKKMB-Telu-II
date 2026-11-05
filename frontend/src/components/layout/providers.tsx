"use client";

import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  // Daftarkan service worker PWA (cache aset statis + notifikasi)
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    try {
      const scale = localStorage.getItem("font-scale");
      if (scale) document.documentElement.dataset.fontScale = scale;
    } catch { /* storage diblokir */ }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster richColors position="top-center" closeButton />
    </ThemeProvider>
  );
}
