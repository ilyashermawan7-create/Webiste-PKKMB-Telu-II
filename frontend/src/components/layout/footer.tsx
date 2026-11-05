import { AtSign, Mail, MessageCircle, ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { PublicSettings } from "@/lib/types";
import { Logo } from "./logo";

export async function Footer({ settings }: { settings: PublicSettings }) {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#141417] text-white/80">
      <div className="h-1 bg-telu-gradient" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo onColor />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">{t("footer.tagline")}</p>
          <p className="mt-3 text-sm font-semibold text-white">Creating the Future</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">{t("footer.explore")}</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            {[["/tentang", "nav.about"], ["/jadwal", "nav.schedule"], ["/atribut", "nav.attire"], ["/kampus", "nav.campus"], ["/fakultas", "nav.faculties"], ["/ukm", "nav.ukm"]].map(([href, key]) => (
              <li key={href}><Link className="hover:text-white" href={href!}>{t(key!)}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">{t("footer.help")}</h2>
          <ul className="mt-4 grid gap-2 text-sm">
            <li><Link className="hover:text-white" href="/faq">{t("nav.faq")}</Link></li>
            <li><Link className="hover:text-white" href="/pengumuman">{t("nav.news")}</Link></li>
            <li><Link className="inline-flex items-center gap-1.5 font-semibold text-[#ff8a8f] hover:text-white" href="/kontak#lapor"><ShieldAlert className="size-4" aria-hidden />{t("footer.report")}</Link></li>
            <li><Link className="hover:text-white" href="/lapor/status">Cek status laporan</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">{t("nav.contact")}</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            <li><a className="inline-flex items-center gap-2 hover:text-white" href={`https://wa.me/${settings.hotline_whatsapp}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="size-4" aria-hidden />Hotline WhatsApp</a></li>
            <li><a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${settings.hotline_email}`}><Mail className="size-4" aria-hidden />{settings.hotline_email}</a></li>
            <li><a className="inline-flex items-center gap-2 hover:text-white" href={`https://instagram.com/${settings.instagram}`} target="_blank" rel="noopener noreferrer"><AtSign className="size-4" aria-hidden />Instagram @{settings.instagram}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/70 sm:px-6">
          © {year} Direktorat Kemahasiswaan Telkom University. {t("footer.rights")} · Jl. Telekomunikasi No. 1, Bandung
        </p>
      </div>
    </footer>
  );
}
