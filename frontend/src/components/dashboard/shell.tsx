"use client";

import {
  Award, BarChart3, BookOpen, Bot, CalendarDays, Circle, ClipboardCheck, ClipboardList, FileStack, IdCard, LayoutDashboard,
  LifeBuoy, LogOut, Megaphone, Menu, QrCode, ScanLine, ScrollText, Settings, Trophy, Users, X, type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { A11yControls } from "@/components/layout/a11y-controls";
import { Logo } from "@/components/layout/logo";
import type { User } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import { MOBILE_KEYS, type NavItem } from "./nav-config";

// Peta ikon eksplisit (bukan `import *`) agar bundle tetap kecil
const ICONS: Record<string, LucideIcon> = {
  Award, BarChart3, BookOpen, Bot, CalendarDays, ClipboardCheck, ClipboardList, FileStack, IdCard, LayoutDashboard,
  LifeBuoy, Megaphone, QrCode, ScanLine, ScrollText, Settings, Trophy, Users,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const I = ICONS[name] ?? Circle;
  return <I className={className} aria-hidden />;
}

const ROLE_LABEL = { MABA: "Young TeluTizen", MENTOR: "Mentor", PANITIA: "Panitia", ADMIN: "Admin" } as const;

/** Kerangka dashboard: sidebar desktop, drawer + bottom-nav mobile, pengumuman live (SSE). */
export function DashboardShell({ user, nav, children }: { user: User; nav: NavItem[]; children: React.ReactNode }) {
  const t = useTranslations("dash");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = nav.filter((n) => !n.roles || n.roles.includes(user.role));
  const isActive = (href: string) => (href === "/dashboard" || href === "/admin" || href === "/mentor" ? pathname === href : pathname.startsWith(href));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Pengumuman live via Server-Sent Events (auto-reconnect bawaan EventSource)
  useEffect(() => {
    const es = new EventSource("/api/proxy/announcements/stream");
    es.addEventListener("announcement", (e) => {
      try {
        const a = JSON.parse((e as MessageEvent).data);
        toast(a.title, { description: a.body?.slice(0, 120), duration: 8000 });
        if (document.visibilityState === "hidden" && "Notification" in window && Notification.permission === "granted") {
          new Notification(a.title, { body: a.body?.slice(0, 120), icon: "/brand/icon-192.png" });
        }
      } catch { /* abaikan payload rusak */ }
    });
    return () => es.close();
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  };

  const NavList = ({ compact }: { compact?: boolean }) => (
    <ul className="grid gap-0.5">
      {items.map((n) => (
        <li key={n.href}>
          <Link href={n.href} aria-current={isActive(n.href) ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", isActive(n.href) ? "bg-telu-gradient text-white shadow-md shadow-telu-red/20" : "text-muted-foreground hover:bg-muted hover:text-foreground", compact && "py-3")}>
            <Icon name={n.icon} className="size-[18px]" />{t(n.key)}
          </Link>
        </li>
      ))}
    </ul>
  );

  const profile = (
    <Link href="/dashboard/profil" className={cn("flex items-center gap-3 rounded-xl p-2 hover:bg-muted", user.role !== "MABA" && "pointer-events-none")}>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-telu-gradient text-sm font-bold text-white">{initials(user.name)}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{user.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{user.nim ?? ROLE_LABEL[user.role]}{user.group ? ` · ${user.group.name}` : ""}</span>
      </span>
    </Link>
  );

  const mobile = items.filter((n) => MOBILE_KEYS.includes(n.key)).slice(0, 4);

  return (
    <div className="min-h-dvh bg-muted/40 lg:grid lg:grid-cols-[264px_1fr]">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-background p-4 lg:flex">
        <Logo href="/" />
        <p className="mt-2 px-1 text-[11px] font-bold uppercase tracking-widest text-primary">{ROLE_LABEL[user.role]}</p>
        <nav className="mt-6 flex-1 overflow-y-auto" aria-label="Menu dashboard"><NavList /></nav>
        <div className="border-t border-border pt-3">
          {profile}
          <div className="mt-2 flex items-center justify-between">
            <A11yControls />
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"><LogOut className="size-4" aria-hidden />{t("logout")}</button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Topbar mobile */}
        <header className="glass sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
          <Logo href="/" className="[&_img]:h-7" />
          <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-lg hover:bg-muted" aria-label="Buka menu" aria-expanded={open}><Menu className="size-5" /></button>
        </header>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu dashboard">
            <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-label="Tutup menu" />
            <div className="absolute inset-y-0 right-0 flex w-[85%] max-w-xs flex-col bg-background p-4 shadow-2xl">
              <div className="flex items-center justify-between">{profile}<button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-lg hover:bg-muted" aria-label="Tutup"><X className="size-5" /></button></div>
              <nav className="mt-4 flex-1 overflow-y-auto"><NavList compact /></nav>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <A11yControls />
                <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><LogOut className="size-4" aria-hidden />{t("logout")}</button>
              </div>
            </div>
          </div>
        )}

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 outline-none sm:px-6 lg:pb-12 lg:pt-10">{children}</main>

        {/* Bottom-nav mobile */}
        <nav className="glass fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Navigasi cepat">
          {mobile.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined}
              className={cn("flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", isActive(n.href) ? "text-primary" : "text-muted-foreground")}>
              <Icon name={n.icon} className="size-5" />{t(n.key)}
            </Link>
          ))}
          <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-muted-foreground"><Menu className="size-5" aria-hidden />Menu</button>
        </nav>
      </div>
    </div>
  );
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
