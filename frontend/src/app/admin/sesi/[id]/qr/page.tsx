import { QrDisplay } from "./qr-display";

export const metadata = { title: "QR Presensi" };

export default async function QrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QrDisplay sessionId={Number(id)} />;
}
