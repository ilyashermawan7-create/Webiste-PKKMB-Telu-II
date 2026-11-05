import type { Metadata } from "next";
import { AnnouncementCard } from "@/components/pkkmb/announcement-card";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { EmptyState } from "@/components/ui/misc";
import { publicApi } from "@/lib/api-server";
import { fallbackAnnouncements } from "@/lib/fallback";
import type { Announcement } from "@/lib/types";

export const metadata: Metadata = { title: "Pengumuman & Berita", description: "Pengumuman resmi PKKMB Telkom University." };
export const revalidate = 60;

export default async function NewsPage() {
  const items = await publicApi<Announcement[]>("/announcements?per_page=30", fallbackAnnouncements);
  return (
    <>
      <PageHeader eyebrow="Pengumuman" title="Kabar resmi PKKMB" description="Informasi terbaru dari panitia. Pengumuman khusus gugus & fakultas tampil di dashboard secara live." />
      <Container className="mt-12">
        {items.length === 0 ? <EmptyState title="Belum ada pengumuman" /> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => <AnnouncementCard key={a.id} a={a} href={`/pengumuman/${a.id}`} />)}
          </div>
        )}
      </Container>
    </>
  );
}
