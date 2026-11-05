import { Award, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { Badge } from "@/components/ui/badge";
import { publicApi } from "@/lib/api-server";
import { fallbackFaculties } from "@/lib/fallback";
import type { Faculty } from "@/lib/types";

export const metadata: Metadata = { title: "Fakultas & Program Studi", description: "Tujuh fakultas Telkom University: FTE, FRI, FIF, FEB, FKB, FIK, dan FIT beserta program studinya." };
export const revalidate = 3600;

export default async function FacultiesPage() {
  const faculties = await publicApi<Faculty[]>("/faculties", fallbackFaculties);
  return (
    <>
      <PageHeader eyebrow="Fakultas" title="7 fakultas, satu semangat Creating the Future" description="Kenali fakultas dan program studi tempat kamu akan bertumbuh." />
      <Container className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {faculties.map((f) => (
          <article key={f.code} id={f.code} className="group flex flex-col rounded-3xl border border-border bg-card p-6 transition hover:border-telu-red/40 hover:shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-telu-gradient font-heading text-lg font-extrabold text-white">{f.code}</span>
              <Badge variant="neutral"><GraduationCap />{f.study_programs_count ?? f.study_programs?.length ?? 0} prodi</Badge>
            </div>
            <h2 className="mt-5 text-xl font-extrabold">{f.name}</h2>
            {f.name_en && <p className="text-sm text-muted-foreground">{f.name_en}</p>}
            <p className="mt-3 text-sm text-muted-foreground">{f.description}</p>
            {f.study_programs && f.study_programs.length > 0 && (
              <details className="mt-5 rounded-xl bg-muted/60 p-3 [&_summary]:cursor-pointer">
                <summary className="text-sm font-semibold">Lihat program studi</summary>
                <ul className="mt-3 grid gap-1.5 text-sm">
                  {f.study_programs.map((p) => (
                    <li key={p.code} className="flex items-center justify-between gap-2">
                      <span>{p.name}</span>
                      {p.accreditation && <Badge variant="success"><Award />{p.accreditation}</Badge>}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </article>
        ))}
      </Container>
    </>
  );
}
