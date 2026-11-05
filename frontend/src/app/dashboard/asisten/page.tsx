import { PageTitle } from "@/components/dashboard/shell";
import { AssistantChat } from "./chat";

export const metadata = { title: "Asisten PKKMB" };

export default function AssistantPage() {
  return (
    <>
      <PageTitle title="Asisten PKKMB" description="Tanya apa saja seputar PKKMB. Jawaban bersumber dari FAQ & buku panduan resmi." />
      <AssistantChat />
    </>
  );
}
