import { ImageIcon } from "lucide-react";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { EmptyState } from "@/components/ui/misc";
import { publicApi } from "@/lib/api-server";
import { fallbackGallery } from "@/lib/fallback";
import type { GalleryItem } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Galeri Dokumentasi", description: "Dokumentasi kegiatan PKKMB Telkom University." };
export const revalidate = 600;

export default async function GalleryPage() {
  const items = await publicApi<GalleryItem[]>("/gallery", fallbackGallery);
  return (
    <>
      <PageHeader eyebrow="Galeri" title="Momen PKKMB" description="Dokumentasi resmi panitia. Foto peserta hanya ditampilkan dengan persetujuan." />
      <Container className="mt-12">
        {items.length === 0 ? <EmptyState icon={<ImageIcon />} title="Galeri belum tersedia" /> : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>figure]:mb-4">
            {items.map((g) => (
              <figure key={g.id} className="group break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element -- sumber gambar dinamis dari storage (S3/R2) */}
                <img src={g.image_url} alt={g.caption ?? g.title} loading="lazy" decoding="async" className="w-full transition duration-500 group-hover:scale-[1.03]" />
                <figcaption className="p-4">
                  <p className="font-semibold">{g.title}</p>
                  {g.taken_at && <p className="text-xs text-muted-foreground">{formatDate(g.taken_at)}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
