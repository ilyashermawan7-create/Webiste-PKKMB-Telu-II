import { PageTitle } from "@/components/dashboard/shell";
import { UsersAdmin } from "./users-admin";

export const metadata = { title: "Pengguna & Gugus" };

export default function UsersPage() {
  return (
    <>
      <PageTitle title="Pengguna & gugus" description="Import data maba/mentor, bagi gugus otomatis, dan tetapkan mentor." />
      <UsersAdmin />
    </>
  );
}
