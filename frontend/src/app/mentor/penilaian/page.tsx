import { PageTitle } from "@/components/dashboard/shell";
import { serverApi } from "@/lib/api-server";
import type { Submission } from "@/lib/types";
import { Grading } from "./grading";

export const metadata = { title: "Penilaian" };

export default async function GradingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "SUBMITTED" } = await searchParams;
  const { data } = await serverApi<{ data: Submission[] }>(`/mentor/submissions?status=${encodeURIComponent(status)}`);
  return (
    <>
      <PageTitle title="Penilaian tugas" description="Beri nilai & umpan balik yang membangun. Hindari komentar merendahkan." />
      <Grading items={data} status={status} />
    </>
  );
}
