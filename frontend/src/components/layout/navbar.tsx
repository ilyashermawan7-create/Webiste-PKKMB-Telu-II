"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { A11yControls } from "./a11y-controls";
import { Logo } from "./logo";

const LINKS = [
  ["/tentang", "about"], ["/jadwal", "schedule"], ["/atribut", "attire"], ["/kampus", "campus"],
  ["/fakultas", "faculties"], ["/ukm", "ukm"], ["/pengumuman", "news"], ["/galeri", "gallery"], ["/faq", "faq"], ["/kontak", "contact"],
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dashboardHref, setDashboardHref] = useState<string | null>(null);

  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )pkkmb_home=([^;]+)/);
    setDashboardHref(m ? decodeURIComponent(m[1]!) : null);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const primary = LINKS.slice(0, 6);
  // Sebelum di-scroll navbar berada di atas header merah → teks putih
  const onColor = !scrolled && !open;

  return (
    <header className={cn("sticky top-0 z-40 transition-all", scrolled ? "glass border-b border-border/60 shadow-sm" : "bg-transparent")}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6" aria-label="Navigasi utama">
        <Logo tone={onColor ? "white" : "color"} />
        <ul className="ml-4 hidden items-center gap-0.5 xl:flex">
          {primary.map(([href, key]) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={pathname.startsWith(href) ? "page" : undefined}
                className={cn("rounded-lg px-3 py-2 text-sm font-medium transition", onColor ? "text-white/85 hover:text-white" : "text-muted-foreground hover:text-foreground", pathname.startsWith(href) && (onColor ? "text-white underline underline-offset-8" : "text-primary"))}
              >
                {t(key)}
              </Link>
            </li>
          ))}
          <li className="group relative">
            <button type="button" className={cn("rounded-lg px-3 py-2 text-sm font-medium", onColor ? "text-white/85 hover:text-white" : "text-muted-foreground hover:text-foreground")} aria-haspopup="true">{t("more")}</button>
            <ul className="invisible absolute left-0 top-full w-48 translate-y-1 rounded-xl border border-border bg-background p-1.5 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {LINKS.slice(6).map(([href, key]) => (
                <li key={href}><Link href={href} className="block rounded-lg px-3 py-2 text-sm hover:bg-muted">{t(key)}</Link></li>
              ))}
            </ul>
          </li>
        </ul>
        <div className="ml-auto flex items-center gap-1">
          <A11yControls className="hidden sm:flex" invert={onColor} />
          {dashboardHref ? (
            <Button asChild size="sm" className={cn("hidden sm:inline-flex", onColor && "bg-white bg-none text-telu-maroon hover:bg-white/90")}><Link href={dashboardHref}><LayoutDashboard />{t("dashboard")}</Link></Button>
          ) : (
            <Button asChild size="sm" className={cn("hidden sm:inline-flex", onColor && "bg-white bg-none text-telu-maroon hover:bg-white/90")}><Link href="/login"><LogIn />{t("login")}</Link></Button>
          )}
          <Button variant="ghost" size="icon" className={cn("xl:hidden", onColor && "text-white hover:bg-white/10")} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t("close") : t("menu")}>
            {open ? <X className="!size-5" /> : <Menu className="!size-5" />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-0 top-16 z-40 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background px-4 pb-10 pt-4 xl:hidden"
          >
            <ul className="grid gap-1">
              <li><Link href="/" className="block rounded-xl px-4 py-3 text-base font-semibold hover:bg-muted">{t("home")}</Link></li>
              {LINKS.map(([href, key]) => (
                <li key={href}>
                  <Link href={href} className={cn("block rounded-xl px-4 py-3 text-base font-semibold hover:bg-muted", pathname.startsWith(href) && "bg-telu-red-50 text-telu-maroon dark:bg-telu-red/15 dark:text-primary")}>{t(key)}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-6">
              <A11yControls />
              <Button asChild><Link href={dashboardHref ?? "/login"}>{dashboardHref ? t("dashboard") : t("login")}</Link></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
