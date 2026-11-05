import { AtSign, Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { ReportForm } from "@/components/pkkmb/report-form";
import { Container, PageHeader, SectionHeading } from "@/components/pkkmb/section";
import { publicApi } from "@/lib/api-server";
import { fallbackSettings } from "@/lib/fallback";
import type { PublicSettings } from "@/lib/types";

export const metadata: Metadata = { title: "Kontak & Pengaduan", description: "Hotline PKKMB Telkom University dan formulir pengaduan anonim kekerasan/perpeloncoan." };
export const revalidate = 600;

export default async function ContactPage() {
  const s = { ...fallbackSettings, ...(await publicApi<PublicSettings>("/settings", fallbackSettings)) };
  const channels = [
    [MessageCircle, "WhatsApp Hotline", `+${s.hotline_whatsapp}`, `https://wa.me/${s.hotline_whatsapp}`],
    [Mail, "Email", s.hotline_email, `mailto:${s.hotline_email}`],
    [AtSign, "Instagram", `@${s.instagram}`, `https://instagram.com/${s.instagram}`],
    [Phone, "Darurat kampus (24 jam)", "Pos keamanan & klinik", `https://wa.me/${s.hotline_whatsapp}`],
  ] as const;
  return (
    <>
      <PageHeader eyebrow="Kontak" title="Kami siap membantu" description="Hubungi panitia untuk pertanyaan, atau laporkan secara anonim bila kamu melihat/mengalami kekerasan." />
      <Container className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map(([Icon, label, value, href]) => (
          <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="rounded-2xl border border-border bg-card p-5 transition hover:border-telu-red/40 hover:shadow-md">
            <Icon className="size-6 text-primary" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">{label}</p>
            <p className="font-bold">{value}</p>
          </a>
        ))}
      </Container>
      <Container className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.3fr]" id="lapor">
        <SectionHeading eyebrow="Pengaduan anonim" title="Laporkan kekerasan atau perpeloncoan" description="Setiap laporan ditangani tim Satgas Pencegahan dan Penanganan Kekerasan (PPK) Telkom University secara rahasia. Kamu tidak sendiri." />
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8"><ReportForm /></div>
      </Container>
    </>
  );
}
