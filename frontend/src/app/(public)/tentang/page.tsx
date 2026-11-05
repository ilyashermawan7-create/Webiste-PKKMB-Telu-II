import { Accessibility, BookOpenCheck, HandHeart, Lightbulb, ShieldBan, ShieldCheck, Sparkles, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader, SectionHeading } from "@/components/pkkmb/section";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Tentang PKKMB", description: "Tujuan, nilai, tata tertib, dan komitmen anti-perpeloncoan PKKMB Telkom University." };

const goals = [
  [BookOpenCheck, "Mengenal sistem akademik", "Kurikulum, SKS, LMS, layanan akademik, dan etika akademik."],
  [Users, "Membangun relasi", "Kenal teman satu gugus, mentor, kakak tingkat, dan dosen."],
  [Lightbulb, "Menumbuhkan jiwa inovatif", "Kewirausahaan, riset, dan budaya Creating the Future."],
  [HandHeart, "Wawasan kebangsaan", "Pancasila, bela negara, anti-korupsi, dan toleransi."],
] as const;

const values = [
  ["Edukatif", "Seluruh kegiatan berorientasi pada pembelajaran, bukan senioritas."],
  ["Inklusif", "Ramah bagi semua latar belakang dan mahasiswa dengan disabilitas."],
  ["Humanis", "Tanpa bentakan, intimidasi, maupun hukuman fisik."],
  ["Kolaboratif", "Gamifikasi dihitung per gugus agar saling mendukung, bukan bersaing individu."],
];

const rules = [
  "Hadir 15 menit sebelum sesi dimulai dan melakukan presensi melalui dashboard.",
  "Mengenakan atribut sesuai ketentuan dan membawa kartu identitas digital.",
  "Menjaga sopan santun, kebersihan, dan fasilitas kampus.",
  "Izin tidak hadir diajukan melalui tiket bantuan dengan bukti pendukung.",
  "Dilarang membawa rokok/vape, senjata tajam, dan minuman beralkohol.",
  "Mengikuti arahan panitia demi keselamatan, termasuk saat kondisi darurat.",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Tentang" title="PKKMB: langkah pertama menjadi Young TeluTizen" description="Pengenalan Kehidupan Kampus bagi Mahasiswa Baru diselenggarakan Direktorat Kemahasiswaan Telkom University untuk membantu kamu beradaptasi dengan kehidupan kampus." />

      <Container className="mt-16">
        <SectionHeading eyebrow="Tujuan" title="Apa yang akan kamu dapatkan" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map(([Icon, title, desc]) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <Icon className="size-7 text-primary" aria-hidden />
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-20 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Nilai" title="Prinsip penyelenggaraan" />
          <dl className="mt-8 space-y-4">
            {values.map(([k, v]) => (
              <div key={k} className="flex gap-4 rounded-2xl bg-muted/60 p-4">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div><dt className="font-bold">{k}</dt><dd className="text-sm text-muted-foreground">{v}</dd></div>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <SectionHeading eyebrow="Tata tertib" title="Yang perlu kamu patuhi" />
          <ol className="mt-8 space-y-3">
            {rules.map((r, i) => (
              <li key={r} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-telu-maroon text-xs font-bold text-white">{i + 1}</span>
                <span className="pt-0.5">{r}</span>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      <Container className="mt-20">
        <div className="grid gap-6 rounded-3xl border-2 border-telu-red/30 bg-telu-red-50/60 p-8 dark:bg-telu-red/5 md:grid-cols-[1fr_1fr]">
          <div>
            <ShieldCheck className="size-10 text-primary" aria-hidden />
            <h2 className="mt-4 text-2xl font-extrabold">Komitmen anti-perpeloncoan & kekerasan</h2>
            <p className="mt-2 text-muted-foreground">Sesuai Panduan PKKMB Kemdiktisaintek dan Permendikbudristek No. 55/2024 tentang Pencegahan dan Penanganan Kekerasan, Telkom University menjamin PKKMB yang aman bagi semua.</p>
            <Button asChild className="mt-6"><Link href="/kontak#lapor">Laporkan pelanggaran</Link></Button>
          </div>
          <ul className="grid gap-3 text-sm">
            {[
              [ShieldBan, "Dilarang: hukuman fisik, bentakan, intimidasi, dan tugas yang merendahkan martabat."],
              [ShieldBan, "Dilarang: meminta uang/barang, atau atribut yang memberatkan dan tidak relevan."],
              [ShieldBan, "Dilarang: pelecehan seksual dalam bentuk apa pun, termasuk verbal dan daring."],
              [Accessibility, "Akomodasi disabilitas: pendamping, kursi prioritas, juru bahasa isyarat, materi aksesibel."],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof ShieldBan;
              return <li key={i} className="flex gap-3 rounded-xl bg-background p-3"><I className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden /><span>{text as string}</span></li>;
            })}
          </ul>
        </div>
      </Container>
    </>
  );
}
