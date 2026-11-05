import type { Metadata } from "next";
import { OrgDirectory } from "@/components/pkkmb/org-directory";
import { Container, PageHeader } from "@/components/pkkmb/section";
import { publicApi } from "@/lib/api-server";
import { fallbackOrganizations } from "@/lib/fallback";
import type { Organization } from "@/lib/types";

export const metadata: Metadata = { title: "Direktori UKM", description: "Unit Kegiatan Mahasiswa Telkom University: teknologi, seni, olahraga, kerohanian, sosial, dan penalaran." };
export const revalidate = 3600;

export default async function UkmPage() {
  const orgs = await publicApi<Organization[]>("/organizations", fallbackOrganizations);
  return (
    <>
      <PageHeader eyebrow="UKM" title="Temukan komunitasmu" description="Kembangkan minat dan bakat bersama Unit Kegiatan Mahasiswa. Kunjungi Expo UKM pada hari ke-3!" />
      <Container className="mt-12"><OrgDirectory orgs={orgs} /></Container>
    </>
  );
}
