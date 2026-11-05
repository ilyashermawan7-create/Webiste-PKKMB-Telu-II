import { ArrowRight, Building2, CalendarDays, GraduationCap, HeartHandshake, Map, Shirt, ShieldCheck, Sparkles, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { AnnouncementCard } from "@/components/pkkmb/announcement-card";
import { CircuitBg } from "@/components/pkkmb/circuit-bg";
import { Countdown } from "@/components/pkkmb/countdown";
import { Container, SectionHeading } from "@/components/pkkmb/section";
import { StatCard } from "@/components/pkkmb/stat-card";
import { Button } from "@/components/ui/button";
import { publicApi } from "@/lib/api-server";
import { SITE_URL } from "@/lib/config";
import { fallbackAnnouncements, fallbackSettings, fallbackStats } from "@/lib/fallback";
import type { Announcement, PublicSettings, PublicStats } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

type Settings = PublicSettings & { rector_message?: string; director_message?: string };

export default async function HomePage() {
  const [s, stats, news] = await Promise.all([
    publicApi<Settings>("/settings", fallbackSettings),
    publicApi<PublicStats>("/stats", fallbackStats),
    publicApi<Announcement[]>("/announcements?per_page=3", fallbackAnnouncements),
  ]);
  const settings = { ...fallbackSettings, ...s };
  const t = await getTranslations("hero");

  // Structured data schema.org/Event untuk SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `PKKMB Telkom University ${settings.year}: ${settings.theme_title}`,
    description: settings.theme_tagline,
    startDate: settings.event_start,
    endDate: settings.event_end,
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "Telkom University", address: { "@type": "PostalAddress", streetAddress: "Jl. Telekomunikasi No. 1", addressLocality: "Bandung", addressRegion: "Jawa Barat", addressCountry: "ID" } },
    organizer: { "@type": "Organization", name: "Direktorat Kemahasiswaan Telkom University", url: SITE_URL },
    image: [`${SITE_URL}/opengraph-image`],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ---------- HERO ---------- */}
      <section className="relative -mt-16 overflow-hidden bg-telu-gradient text-white">
        <div className="bg-tech-grid absolute inset-0 opacity-40 [--foreground:#fff]" aria-hidden />
        <CircuitBg className="text-white/15" />
        <div className="absolute -right-40 -top-40 size-[520px] rounded-full bg-white/10 blur-3xl" aria-hidden />
        <Container className="relative grid gap-12 pb-16 pt-32 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:pb-24 lg:pt-40">
          <div>
            <p className="glass-on-color inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="size-3.5" aria-hidden />{t("eyebrow")} {settings.year}
            </p>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              {settings.theme_title}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg text-white/90 sm:text-xl">{t("welcome")} {settings.theme_tagline}.</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-white/85">
              <CalendarDays className="size-4" aria-hidden />
              {formatDate(settings.event_start, { day: "numeric", month: "long" })} – {formatDate(settings.event_end)} · Telkom University, Bandung
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-white bg-none text-telu-maroon shadow-xl hover:bg-white/90 hover:brightness-100"><Link href="/login">{t("ctaLogin")}<ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="glass"><Link href="/jadwal">{t("ctaSchedule")}</Link></Button>
            </div>
            <div className="mt-10"><Countdown start={settings.event_start} end={settings.event_end} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <StatCard tone="glass" icon={<Users aria-hidden />} label="Young TeluTizen" value={stats.maba} suffix="+" />
            <StatCard tone="glass" icon={<Building2 aria-hidden />} label="Fakultas" value={stats.faculties} />
            <StatCard tone="glass" icon={<GraduationCap aria-hidden />} label="Program studi" value={stats.study_programs} />
            <StatCard tone="glass" icon={<HeartHandshake aria-hidden />} label="UKM & komunitas" value={stats.organizations} />
          </div>
        </Container>
        <svg className="relative block h-10 w-full text-background" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden><path d="M0 40h1440V0C1080 32 360 32 0 0z" fill="currentColor" /></svg>
      </section>

      {/* ---------- TEASER + RANGKAIAN ---------- */}
      <Container className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-[#141417] shadow-xl">
          {settings.teaser_video_url ? (
            <iframe className="absolute inset-0 h-full w-full" src={settings.teaser_video_url} title="Video teaser PKKMB" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center text-white">
              <CircuitBg className="text-white/10" />
              <div className="relative">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-telu-gradient shadow-lg"><Sparkles className="size-7" aria-hidden /></div>
                <p className="mt-4 font-heading text-xl font-bold">Video teaser segera hadir</p>
                <p className="text-sm text-white/70">Nantikan di Instagram @{settings.instagram}</p>
              </div>
            </div>
          )}
        </div>
        <div>
          <SectionHeading eyebrow="Rangkaian PKKMB" title="Tiga tahap menuju Young TeluTizen" description="Dirancang edukatif, inklusif, dan bebas perpeloncoan sesuai Panduan PKKMB Kemdiktisaintek." />
          <ol className="mt-8 space-y-4">
            {[
              ["01", "Pre-PKKMB (daring)", "Aktivasi akun, literasi digital, dan pengenalan LMS dari rumah."],
              ["02", "PKKMB Universitas", "Per batch di TUCH & kelas TULT: kebangsaan, akademik, anti-kekerasan, dan Expo UKM."],
              ["03", "PKKMB Fakultas & Prodi", "Mengenal dekanat, prodi, laboratorium, himpunan, dan kakak tingkat."],
            ].map(([n, title, desc]) => (
              <li key={n} className="flex gap-4 rounded-2xl border border-border p-4">
                <span className="font-heading text-2xl font-extrabold text-telu-gradient">{n}</span>
                <div><p className="font-bold">{title}</p><p className="text-sm text-muted-foreground">{desc}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      {/* ---------- SAMBUTAN ---------- */}
      <section className="mt-24 bg-muted/60 py-20">
        <Container>
          <SectionHeading align="center" eyebrow="Sambutan" title="Pesan untuk Young TeluTizen" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              ["Rektor Telkom University", settings.rector_message ?? "Selamat datang di Telkom University. Jadikan kampus ini ruang untuk bertumbuh dan berdampak."],
              ["Direktur Kemahasiswaan", settings.director_message ?? "PKKMB adalah langkah pertama mengenal kampus, nilai-nilai, dan sesama."],
            ].map(([role, msg]) => (
              <figure key={role} className="relative rounded-3xl border border-border bg-card p-7 shadow-sm">
                <span className="absolute right-6 top-2 font-heading text-8xl leading-none text-telu-red/15" aria-hidden>&rdquo;</span>
                <blockquote className="relative text-pretty text-lg leading-relaxed">{msg}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-telu-gradient text-white" aria-hidden><GraduationCap className="size-6" /></span>
                  <span><span className="block font-bold">{role}</span><span className="text-sm text-muted-foreground">Telkom University</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- ANTI PERPELONCOAN ---------- */}
      <Container className="mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-[#141417] p-8 text-white sm:p-12">
          <CircuitBg className="text-white/10" />
          <div className="relative grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-center">
            <span className="grid size-16 place-items-center rounded-2xl bg-telu-gradient"><ShieldCheck className="size-8" aria-hidden /></span>
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">PKKMB bebas perpeloncoan & kekerasan</h2>
              <p className="mt-2 max-w-2xl text-white/80">Tidak ada bentakan, hukuman fisik, atau tugas yang merendahkan. Jika kamu melihat atau mengalaminya, laporkan — identitasmu dirahasiakan.</p>
            </div>
            <Button asChild size="lg" className="bg-white bg-none text-telu-maroon hover:bg-white/90 hover:brightness-100"><Link href="/kontak#lapor">Lapor anonim</Link></Button>
          </div>
        </div>
      </Container>

      {/* ---------- JELAJAHI ---------- */}
      <Container className="mt-24">
        <SectionHeading eyebrow="Persiapkan dirimu" title="Semua yang perlu kamu tahu" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [CalendarDays, "Jadwal interaktif", "Filter per hari, batch, dan fakultas.", "/jadwal"],
            [Shirt, "Atribut & dress code", "Checklist putra, putri, dan sepatu.", "/atribut"],
            [Map, "Kenali kampus", "Peta interaktif TULT, TUCH, asrama, klinik.", "/kampus"],
            [Building2, "Fakultas & UKM", "7 fakultas, puluhan prodi, dan UKM.", "/fakultas"],
          ].map(([Icon, title, desc, href]) => {
            const I = Icon as typeof Map;
            return (
              <Link key={href as string} href={href as string} className="group rounded-2xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-telu-red/40 hover:shadow-lg">
                <span className="grid size-12 place-items-center rounded-xl bg-telu-red-50 text-telu-maroon transition group-hover:bg-telu-gradient group-hover:text-white dark:bg-telu-red/15 dark:text-primary"><I className="size-6" aria-hidden /></span>
                <h3 className="mt-4 font-bold">{title as string}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc as string}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Buka <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden /></span>
              </Link>
            );
          })}
        </div>
      </Container>

      {/* ---------- PENGUMUMAN ---------- */}
      <Container className="mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Kabar terbaru" title="Pengumuman" />
          <Button asChild variant="outline"><Link href="/pengumuman">Semua pengumuman<ArrowRight /></Link></Button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {news.slice(0, 3).map((a) => <AnnouncementCard key={a.id} a={a} href={`/pengumuman/${a.id}`} />)}
        </div>
      </Container>
    </>
  );
}
