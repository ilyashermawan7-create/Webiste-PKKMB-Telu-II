import type { Metadata } from "next";
import { FaqSearch } from "@/components/pkkmb/faq-search";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { publicApi } from "@/lib/api-server";
import { fallbackFaqs } from "@/lib/fallback";
import type { Faq } from "@/lib/types";

export const metadata: Metadata = { title: "FAQ", description: "Pertanyaan yang sering diajukan seputar PKKMB Telkom University." };
export const revalidate = 600;

export default async function FaqPage() {
  const faqs = await publicApi<Faq[]>("/faqs", fallbackFaqs);
  const jsonLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHeader eyebrow="FAQ" title="Ada pertanyaan?" description="Cari jawaban cepat di sini. Tidak ketemu? Tanyakan ke Asisten PKKMB atau hotline panitia." />
      <Container className="mt-12 max-w-3xl"><FaqSearch faqs={faqs} /></Container>
    </>
  );
}
