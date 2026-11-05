import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { publicApi } from "@/lib/api-server";
import type { Announcement } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

async function get(id: string) {
  if (!/^\d+$/.test(id)) return null;
  return publicApi<Announcement | null>(`/announcements/${id}`, null);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const a = await get((await params).id);
  return a ? { title: a.title, description: a.body.slice(0, 150), openGraph: { title: a.title, description: a.body.slice(0, 150), type: "article" } } : { title: "Pengumuman" };
}

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const a = await get((await params).id);
  if (!a) notFound();
  return (
    <>
      <PageHeader eyebrow={a.category} title={a.title} description={`${formatDate(a.published_at)} · ${a.author?.name ?? "Panitia PKKMB"}`} />
      <Container className="mt-12 max-w-3xl">
        <article className="whitespace-pre-line text-lg leading-relaxed">{a.body}</article>
        <Link href="/pengumuman" className="mt-10 inline-flex items-center gap-1 font-semibold text-primary"><ArrowLeft className="size-4" aria-hidden />Kembali ke pengumuman</Link>
      </Container>
    </>
  );
}
