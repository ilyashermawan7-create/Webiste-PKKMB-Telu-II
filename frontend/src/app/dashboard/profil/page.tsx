import { PageTitle } from "@/components/dashboard/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/api-server";
import { ProfileForms } from "./forms";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  return (
    <>
      <PageTitle title="Profil" description="Data akademik dikelola Direktorat Akademik. Kamu bisa memperbarui kontak & kebutuhan aksesibilitas." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Data mahasiswa</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid gap-3 text-sm">
              {[["Nama", user.name], ["NIM", user.nim], ["Email", user.email], ["Fakultas", user.faculty?.name], ["Program studi", user.study_program?.name], ["Gugus", user.group?.name], ["Batch", user.batch]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v ?? "-"}</dd></div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <ProfileForms phone={user.phone ?? ""} accessibility={user.accessibility_needs ?? ""} />
      </div>
    </>
  );
}
