import { Badge } from "@/components/ui/badge";
import type { Submission } from "@/lib/types";

export function SubmissionBadge({ s, due }: { s?: Submission | null; due?: string }) {
  if (!s) return due && new Date(due) < new Date() ? <Badge variant="warning">Terlambat</Badge> : <Badge variant="neutral">Belum dikumpulkan</Badge>;
  if (s.status === "GRADED") return <Badge variant="success">Dinilai · {s.score}</Badge>;
  if (s.status === "REVISION") return <Badge variant="warning">Perlu revisi</Badge>;
  return <Badge>Menunggu penilaian</Badge>;
}
