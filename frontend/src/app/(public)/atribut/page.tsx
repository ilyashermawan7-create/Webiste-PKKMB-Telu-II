import { Info } from "lucide-react";
import type { Metadata } from "next";
import { DressCodeChecklist } from "@/components/pkkmb/dress-code";
import { Container, PageHeader } from "@/components/pkkmb/section";

export const metadata: Metadata = { title: "Atribut & Dress Code", description: "Ketentuan atribut Young TeluTizen untuk putra, putri, sepatu, dan barang bawaan, lengkap dengan checklist." };

export default function AttirePage() {
  return (
    <>
      <PageHeader eyebrow="Atribut" title="Dress code Young TeluTizen" description="Sederhana, rapi, dan tidak memberatkan. Centang checklist untuk memastikan semua siap sebelum hari-H — progresmu tersimpan di perangkat ini." />
      <Container className="mt-12 max-w-5xl">
        <DressCodeChecklist />
        <p className="mt-10 flex gap-3 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          Panitia tidak akan meminta atribut tambahan yang memberatkan atau tidak relevan. Bila ada kebutuhan khusus (kesehatan, agama, disabilitas), sampaikan melalui tiket bantuan — kami akan menyesuaikan.
        </p>
      </Container>
    </>
  );
}
