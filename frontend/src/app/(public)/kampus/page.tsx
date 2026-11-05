import { Compass } from "lucide-react";
import type { Metadata } from "next";
import { CampusMap } from "@/components/pkkmb/campus-map";
import { Container, PageHeader, SectionHeading } from "@/components/pkkmb/section";
import { publicApi } from "@/lib/api-server";
import { fallbackPlaces, fallbackSettings } from "@/lib/fallback";
import type { CampusPlace, PublicSettings } from "@/lib/types";

export const metadata: Metadata = { title: "Kenali Kampus", description: "Peta kampus interaktif Telkom University: TULT, TUCH, gedung fakultas, asrama, masjid, klinik, dan virtual tour 360°." };
export const revalidate = 3600;

export default async function CampusPage() {
  const [places, settings] = await Promise.all([
    publicApi<CampusPlace[]>("/places", fallbackPlaces),
    publicApi<PublicSettings>("/settings", fallbackSettings),
  ]);
  return (
    <>
      <PageHeader eyebrow="Kenali Kampus" title="Jelajahi Telkom University" description="Klik penanda untuk melihat detail lokasi. Membuka peta ini juga menyelesaikan misi harian “Jelajahi kampus” di dashboard." />
      <Container className="mt-12"><CampusMap places={places} /></Container>
      <Container className="mt-20">
        <SectionHeading eyebrow="Virtual tour" title="Tur kampus 360°" description="Rasakan suasana kampus sebelum hari-H." />
        <div className="mt-8 aspect-video overflow-hidden rounded-3xl border border-border bg-muted">
          {settings.virtual_tour_url ? (
            <iframe src={settings.virtual_tour_url} title="Virtual tour 360° Telkom University" className="h-full w-full" loading="lazy" allow="fullscreen; gyroscope; accelerometer" allowFullScreen />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-muted-foreground">
              <div><Compass className="mx-auto size-10 text-telu-silver" aria-hidden /><p className="mt-3 font-semibold">Virtual tour akan ditautkan oleh panitia.</p><p className="text-sm">Admin dapat mengisi URL embed di Pengaturan.</p></div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
