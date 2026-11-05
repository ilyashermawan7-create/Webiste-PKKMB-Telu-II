import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { Timeline } from "@/components/pkkmb/timeline";
import { publicApi } from "@/lib/api-server";
import { fallbackFaculties, fallbackSessions } from "@/lib/fallback";
import type { Faculty, PkkmbSession } from "@/lib/types";

export const metadata: Metadata = { title: "Jadwal PKKMB", description: "Timeline interaktif PKKMB Telkom University per hari, batch, dan fakultas." };
export const revalidate = 120;

export default async function SchedulePage() {
  const [sessions, faculties] = await Promise.all([
    publicApi<PkkmbSession[]>("/sessions", fallbackSessions),
    publicApi<Faculty[]>("/faculties", fallbackFaculties),
  ]);
  return (
    <>
      <PageHeader eyebrow="Jadwal" title="Timeline PKKMB" description="Pilih hari, batch, dan fakultasmu. Jadwal personal lengkap dengan status kehadiran tersedia di dashboard." />
      <Container className="mt-12 max-w-4xl">
        <Timeline sessions={sessions} faculties={faculties} />
      </Container>
    </>
  );
}
